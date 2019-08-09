// fork of Codemirror's show-hint addon
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

import CodeMirror from 'codemirror'; // eslint-disable-line import/no-extraneous-dependencies
import {
  get,
  isEmpty,
  forOwn,
  noop
} from 'lodash';

CodeMirror.registerHelper('hint', 'auto', { resolve: resolveAutoHints });

const defaultOptions = {
  hint: CodeMirror.hint.auto,
  completeSingle: true,
  alignWithWord: true,
  closeCharacters: /[\s()[]{};:>,]/,
  closeOnUnfocus: true,
  completeOnSingleClick: true,
  container: null,
  customKeys: null,
  extraKeys: null
};

const HINT_ELEMENT_CLASS = 'CodeMirror-hint';
const ACTIVE_HINT_ELEMENT_CLASS = 'CodeMirror-hint-active';

// This is the old interface, kept around for now to stay backwards-compatible
CodeMirror.showHint = function (cm, getHints, options) {
  if (!getHints) return cm.showHint(options);
  if (options && options.async) getHints.async = true;

  const newOpts = Object.assign({ hint: getHints }, options);

  return cm.showHint(newOpts);
};

CodeMirror.defineExtension('showHint', function (initialOptions) {
  const options = parseOptions(this, this.getCursor('start'), initialOptions);
  const selections = this.listSelections();

  if (selections.length > 1) return;
  // By default, don't allow completion when something is selected.
  // A hint function can have a `supportsSelection` property to
  // indicate that it can handle selections.
  if (this.somethingSelected()) {
    if (!options.hint.supportsSelection) return;
    // Don't try with cross-line selections
    for (let i = 0; i < selections.length; i++) {
      if (selections[i].head.line !== selections[i].anchor.line) return;
    }
  }

  if (this.state.completionActive) this.state.completionActive.close();

  const completion = new Completion(this, options);

  this.state.completionActive = completion;

  if (!completion.options.hint) return;

  CodeMirror.signal(this, 'startCompletion', this);
  completion.update(true);
});

function Completion(cm, options) {
  this.cm = cm;
  this.options = options;
  this.widget = null;
  this.debounce = 0;
  this.tick = 0;
  this.startPos = this.cm.getCursor('start');
  this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;

  this.clearCursorActivityTimeout = () => {
    if (this.cursorActivityTimeoutId) {
      clearTimeout(this.cursorActivityTimeoutId);
      this.timeoutId = null;
    }
  };

  cm.on('cursorActivity', this.activityFunc = () => {
    this.clearCursorActivityTimeout();

    // The timeout is needed to display the hint using the actual heights of the rendered lines
    // (after updateHeightsInViewport is executed)
    this.cursorActivityTimeoutId = setTimeout(() => this.cursorActivity(), 0);
  });
}

Completion.prototype = {
  close() {
    if (!this.active()) return;

    this.cm.state.completionActive = null;
    this.tick = null;

    this.clearCursorActivityTimeout();
    this.cm.off('cursorActivity', this.activityFunc);

    if (this.widget && this.data) CodeMirror.signal(this.data, 'close');
    if (this.widget) this.widget.close();

    CodeMirror.signal(this.cm, 'endCompletion', this.cm);
  },

  active() {
    return this.cm.state.completionActive === this;
  },

  pick(data, i) {
    const completion = data.sections[this.widget.currentSectionIndex].list[i];

    if (completion.hint) {
      completion.hint(this.cm, data, completion);
    } else {
      this.cm.replaceRange(getText(completion), completion.from || data.from,
        completion.to || data.to, 'complete');
    }

    CodeMirror.signal(data, 'pick', completion);
    this.close();
  },

  cursorActivity() {
    if (this.debounce) {
      cancelAnimationFrame(this.debounce);
      this.debounce = 0;
    }

    const pos = this.cm.getCursor();
    const line = this.cm.getLine(pos.line);

    if (pos.line !== this.startPos.line || line.length - pos.ch !== this.startLen - this.startPos.ch ||
      pos.ch < this.startPos.ch || this.cm.somethingSelected() ||
      (pos.ch && this.options.closeCharacters.test(line.charAt(pos.ch - 1)))) {
      this.close();
    } else {
      this.debounce = requestAnimationFrame(() => this.update());

      if (this.widget) this.widget.disable();
    }
  },

  update(first) {
    if (this.tick == null) return;

    const myTick = ++this.tick;

    fetchHints(this.options.hint, this.cm, this.options, data => {
      if (this.tick === myTick) this.finishUpdate(data, first);
    });
  },

  finishUpdate(data, first) {
    if (this.data) CodeMirror.signal(this.data, 'update');

    const picked = (this.widget && this.widget.picked) || (first && this.options.completeSingle);

    if (this.widget) this.widget.close();

    if (data && this.data && isNewCompletion(this.data, data)) return;

    this.data = data;

    if (!isEmpty(get(data, 'sections.0.list'))) {
      if (picked && data.sections.length === 1 && data.sections[0].list.length === 1) {
        this.pick(data, 0);
      } else {
        this.widget = new Widget(this, data);
        CodeMirror.signal(data, 'shown');
      }
    }
  }
};

function isNewCompletion(old, nw) {
  const moved = CodeMirror.cmpPos(nw.from, old.from);

  return moved > 0 && old.to.ch - old.from.ch !== nw.to.ch - nw.from.ch;
}

function parseOptions(cm, pos, options) {
  const editor = cm.options.hintOptions;
  const parsedOptions = Object.assign({}, defaultOptions, editor, options);

  if (parsedOptions.hint.resolve) parsedOptions.hint = parsedOptions.hint.resolve(cm, pos);

  return parsedOptions;
}

function getText(completion) {
  return typeof completion === 'string' ? completion : completion.text;
}

function buildKeyMap(completion, handle) {
  const baseMap = {
    Up() { handle.moveFocus(-1); },
    Down() { handle.moveFocus(1); },
    PageUp() { handle.moveFocus(-handle.menuSize() + 1, true); },
    PageDown() { handle.moveFocus(handle.menuSize() - 1, true); },
    Home() { handle.setFocus(0); },
    End() { handle.setFocus(handle.length - 1); },
    Enter: handle.pick,
    Tab: handle.pick,
    Esc: handle.close
  };
  const custom = completion.options.customKeys;
  const ourMap = custom ? {} : baseMap;

  function addBinding(key, val) {
    let bound;

    if (typeof val !== 'string') {
      bound = function (cm) { return val(cm, handle); };
    } else if (Object.prototype.hasOwnProperty.call(baseMap, val)) {
      // This mechanism is deprecated
      bound = baseMap[val];
    } else {
      bound = val;
    }

    ourMap[key] = bound;
  }

  if (custom) {
    forOwn(custom, (value, key) => addBinding(key, value));
  }

  const extra = completion.options.extraKeys;

  if (extra) {
    forOwn(extra, (value, key) => addBinding(key, value));
  }

  return ourMap;
}

function getHintElement(hintsContainer, targetElement) {
  let currentSearchElement = targetElement;

  while (currentSearchElement && currentSearchElement !== hintsContainer) {
    if (currentSearchElement.nodeName.toUpperCase() === 'LI' && currentSearchElement.parentNode === hintsContainer) {
      return currentSearchElement;
    }

    currentSearchElement = currentSearchElement.parentNode;
  }
}

function Widget(completion, data) {
  this.completion = completion;
  this.data = data;
  this.picked = false;
  const widget = this;
  this.currentSectionIndex = 0;
  this.isBelow = true;
  this.position = {
    left: 0,
    top: 0,
  };

  this.initContainers();
  this.initHintSections();
  (completion.options.container || document.body).appendChild(this.container);
  this.updatePosition();

  const completions = data.sections[this.currentSectionIndex].list;
  const cm = completion.cm;

  cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
    moveFocus(n, avoidWrap) {
      const selectedHintIndex = widget.getSelectedHintInCurrentSection();

      widget.changeActive(selectedHintIndex + n, avoidWrap);
    },
    setFocus(n) { widget.changeActive(n); },
    menuSize() { return widget.screenAmount(); },
    length: completions.length,
    close() { completion.close(); },
    pick() { widget.pick(); },
    data
  }));

  if (completion.options.closeOnUnfocus) {
    let closingOnBlur;
    cm.on('blur', this.onBlur = function () { closingOnBlur = setTimeout(() => { completion.close(); }, 100); });
    cm.on('focus', this.onFocus = function () { clearTimeout(closingOnBlur); });
  }

  const startScroll = cm.getScrollInfo();

  cm.on('scroll', this.onScroll = () => {
    const curScroll = cm.getScrollInfo();
    const editor = cm.getWrapperElement().getBoundingClientRect();
    const newTop = this.position.top + startScroll.top - curScroll.top;
    let point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);

    if (!this.isBelow) point += this.container.offsetHeight;

    if (point <= editor.top || point >= editor.bottom) return completion.close();

    this.container.style.top = `${newTop}px`;
    this.container.style.left = `${this.position.left + startScroll.left - curScroll.left}px`;
  });

  CodeMirror.on(this.container, 'dblclick', (e) => {
    const hint = getHintElement(this.sections[this.currentSectionIndex].listContainer, e.target);

    if (hint && hint.hintId != null) {
      widget.changeActive(hint.hintId);
      widget.pick();
    }
  });

  CodeMirror.on(this.container, 'click', (e) => {
    const hint = getHintElement(this.sections[this.currentSectionIndex].listContainer, e.target);

    if (hint && hint.hintId != null) {
      widget.changeActive(hint.hintId);

      if (completion.options.completeOnSingleClick) {
        widget.pick();
      }
    }
  });

  CodeMirror.on(this.container, 'mousedown', () => {
    setTimeout(() => { cm.focus(); }, 20);
  });

  CodeMirror.signal(data, 'select', completions[0], this.sections[this.currentSectionIndex].getListNode(0));

  return true;
}

Widget.prototype = {
  getSelectedHintInCurrentSection() {
    return this.sections[this.currentSectionIndex].selectedHintIndex;
  },

  initContainers() {
    this.container = createInitDiv('CodeMirror-hints');
    this.sectionsContainer = createInitDiv('CodeMirror-hints-sections-container');

    if (this.data.header) {
      this.container.appendChild(createHeader(this.data.header, 'CodeMirror-hints-header'));
    }

    this.container.appendChild(this.sectionsContainer);
  },

  initHintSections() {
    this.sections = this.data.sections.reduce((memo, section) => {
      const newHintSection = new HintSection(section, this.completion.cm);

      this.sectionsContainer.appendChild(newHintSection.container);

      return memo.concat(newHintSection);
    }, []);
  },

  updatePosition() {
    const cm = this.completion.cm;
    let cursorPosition = cm.cursorCoords(this.completion.options.alignWithWord ? this.data.from : null);
    this.position.left = cursorPosition.left;
    this.position.top = cursorPosition.bottom;

    this.container.style.left = `${this.position.left}px`;
    this.container.style.top = `${this.position.top}px`;

    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
    const winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    const winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);

    let box = this.container.getBoundingClientRect();
    const overlapY = box.bottom - winH;

    if (overlapY > 0) {
      const height = box.bottom - box.top;
      const cursorTop = cursorPosition.top - (cursorPosition.bottom - box.top);

      if (cursorTop - height > 0) { // Fits above cursor
        this.position.top = cursorPosition.top - height;
        this.container.style.top = `${this.position.top}px`;
        this.isBelow = false;
      } else if (height > winH) {
        this.container.style.height = `${winH - 5}px`;
        this.position.top = cursorPosition.bottom - box.top;
        this.container.style.top = `${this.position.top}px`;
        const cursor = cm.getCursor();

        if (this.data.from.ch !== cursor.ch) {
          cursorPosition = cm.cursorCoords(cursor);
          this.position.left = cursorPosition.left;
          this.container.style.left = `${this.position.left}px`;
          box = this.container.getBoundingClientRect();
        }
      }
    }

    let overlapX = box.right - winW;

    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        this.container.style.width = `${winW - 5}px`;
        overlapX -= (box.right - box.left) - winW;
      }

      this.position.left = cursorPosition.left - overlapX;
      this.container.style.left = `${this.position.left}px`;
    }
  },

  close() {
    if (this.completion.widget !== this) return;

    this.completion.widget = null;

    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.completion.cm.removeKeyMap(this.keyMap);
    const cm = this.completion.cm;

    if (this.completion.options.closeOnUnfocus) {
      cm.off('blur', this.onBlur);
      cm.off('focus', this.onFocus);
    }

    cm.off('scroll', this.onScroll);
  },

  disable() {
    this.completion.cm.removeKeyMap(this.keyMap);

    const widget = this;

    this.keyMap = { Enter() { widget.picked = true; } };
    this.completion.cm.addKeyMap(this.keyMap);
  },

  pick() {
    const selectedHintIndex = this.getSelectedHintInCurrentSection();
    const currentItemOptions = this.data.sections[this.currentSectionIndex].list[selectedHintIndex];

    if (selectedHintIndex === -1) return;

    if (!currentItemOptions.inactive) {
      if (this.currentSectionIndex < this.data.sections.length - 1) {
        this.changeSection();
      } else {
        this.completion.pick(this.data, selectedHintIndex);
      }
    }
  },

  changeSection() {
    this.setupNextSectionData();
    this.currentSectionIndex++;

    const {
      list,
      selectedHintIndex,
    } = this.data.sections[this.currentSectionIndex];

    this.sections[this.currentSectionIndex].setList(list, selectedHintIndex);
    this.updatePosition();
  },

  setupNextSectionData() {
    const {
      childSection,
      list,
    } = this.data.sections[this.currentSectionIndex];
    const nextSectionData = this.data.sections[this.currentSectionIndex + 1];
    const parentId = list[this.getSelectedHintInCurrentSection()].id;

    nextSectionData.list = CodeMirror.hint.getSubMenuData(this.completion.cm, { childSection, parentId });
  },

  changeActive(nextActiveHintIndex, avoidWrap) {
    const currentSection = this.sections[this.currentSectionIndex];
    const {
      selectedHintIndex,
      itemsOptions,
    } = currentSection;

    currentSection.changeActive(nextActiveHintIndex, avoidWrap);

    CodeMirror.signal(this.data, 'select', itemsOptions[selectedHintIndex], currentSection.getListNode(selectedHintIndex));
  },

  screenAmount() {
    return Math.floor(this.container.clientHeight / this.sections[this.currentSectionIndex].getListNode(0).offsetHeight) || 1;
  }
};

function HintSection(sectionOptions, cm) {
  this.cm = cm;
  this.container = createInitDiv('CodeMirror-hints-list');
  this.selectedHintIndex = sectionOptions.selectedHintIndex || 0;
  this.defaultSelectedHintIndex = this.selectedHintIndex;
  this.itemsOptions = sectionOptions.list;

  if (sectionOptions.header) {
    this.container.appendChild(createHeader(sectionOptions.header, 'CodeMirror-hints-subheader'));
  }

  this.listContainer = document.createElement('ul');
  this.container.appendChild(this.listContainer);

  if (!isEmpty(get(sectionOptions, 'list'))) {
    this.setList(sectionOptions.list, this.defaultSelectedHintIndex);
  }
}

HintSection.prototype = {
  setList(list, selectedHintIndex = -1) {
    this.clearItemsList();
    this.itemsOptions = list;
    this.selectedHintIndex = selectedHintIndex;

    this.itemsOptions.forEach((currentListItem, i) => {
      const listItemElement = this.listContainer.appendChild(document.createElement('li'));
      let className = HINT_ELEMENT_CLASS + (i !== this.selectedHintIndex ? '' : ` ${ACTIVE_HINT_ELEMENT_CLASS}`);

      if (currentListItem.className) {
        className = currentListItem.className + ` ${className}`;
      }

      listItemElement.className = className;

      if (currentListItem.render) {
        currentListItem.render(listItemElement, this.data, currentListItem);
      } else {
        listItemElement.appendChild(document.createTextNode(currentListItem.displayText || getText(currentListItem)));
      }

      listItemElement.hintId = i;
    });

    this.setupListScrollingPadding();
  },

  clearItemsList() {
    this.selectedHintIndex = this.defaultSelectedHintIndex;
    this.itemsOptions = [];

    while (this.listContainer.firstChild) {
      this.listContainer.removeChild(this.listContainer.firstChild);
    }
  },

  setupListScrollingPadding() {
    if (this.listContainer.scrollHeight > this.listContainer.clientHeight + 1) {
      for (let node = this.listContainer.firstChild; node; node = node.nextSibling) {
        node.style.paddingRight = `${this.cm.display.nativeBarWidth}px`;
      }
    }
  },

  getListNode(index) {
    return this.listContainer.childNodes[index];
  },

  changeActive(nextActiveHintIndex, avoidWrap) {
    let nextIndex = nextActiveHintIndex;

    if (nextIndex >= this.itemsOptions.length) {
      nextIndex = avoidWrap ? this.itemsOptions.length - 1 : 0;
    } else if (nextIndex < 0) {
      nextIndex = avoidWrap ? 0 : this.itemsOptions.length - 1;
    }

    if (this.selectedHintIndex === nextIndex) return;

    let node = this.listContainer.childNodes[this.selectedHintIndex];

    if (node) {
      node.className = node.className.replace(` ${ACTIVE_HINT_ELEMENT_CLASS}`, '');
    }

    this.selectedHintIndex = nextIndex;
    node = this.listContainer.childNodes[this.selectedHintIndex];
    node.className += ` ${ACTIVE_HINT_ELEMENT_CLASS}`;

    if (node.offsetTop < this.listContainer.scrollTop) {
      this.listContainer.scrollTop = node.offsetTop - 3;
    } else if (node.offsetTop + node.offsetHeight > this.listContainer.scrollTop + this.listContainer.clientHeight) {
      this.listContainer.scrollTop = node.offsetTop + node.offsetHeight - this.listContainer.clientHeight + 3;
    }
  },
};

function createHeader(text, className = '') {
  const header = createInitDiv(className);

  header.innerHTML = text;

  return header;
}

function createInitDiv(className = '') {
  const divElement = document.createElement('div');

  divElement.className = className;

  return divElement;
}

function applicableHelpers(cm, helpers) {
  if (!cm.somethingSelected()) return helpers;

  return helpers.reduce((memo, helper) => helper.supportsSelection ? memo.concat(helper) : memo, []);
}

function fetchHints(hint, cm, options, callback) {
  if (hint.async) {
    hint(cm, callback, options);
  } else {
    const result = hint(cm, options);

    if (result && result.then) result.then(callback);
    else callback(result);
  }
}

function resolveAutoHints(cm, pos) {
  const helpers = cm.getHelpers(pos, 'hint');

  if (!isEmpty(helpers)) {
    const resolved = function (codeMirror, callback, options) {
      const app = applicableHelpers(codeMirror, helpers);

      function run(i) {
        if (i === app.length) return callback(null);

        fetchHints(app[i], codeMirror, options, result => {
          if (!isEmpty(get(result, 'sections.0.list'))) {
            callback(result);
          } else {
            run(i + 1);
          }
        });
      }

      run(0);
    };

    resolved.async = true;
    resolved.supportsSelection = true;

    return resolved;
  }

  const words = cm.getHelper(cm.getCursor(), 'hintWords');

  if (words) {
    return function (codeMirror) { return CodeMirror.hint.fromList(codeMirror, { words }); };
  }

  if (CodeMirror.hint.anyword) {
    return function (codeMirror, options) { return CodeMirror.hint.anyword(codeMirror, options); };
  }

  return noop;
}

CodeMirror.registerHelper('hint', 'fromList', (cm, options) => {
  const cur = cm.getCursor();
  const token = cm.getTokenAt(cur);
  const to = CodeMirror.Pos(cur.line, token.end);
  let term;
  let from;

  if (token.string && /\w/.test(token.string[token.string.length - 1])) {
    term = token.string;
    from = CodeMirror.Pos(cur.line, token.start);
  } else {
    term = '';
    from = to;
  }

  const found = options.words.reduce((memo, word) => {
    return (word.slice(0, term.length) === term) ? memo.concat(word) : memo;
  }, []);

  if (found.length) return { list: found, from, to };
});

CodeMirror.commands.autocomplete = CodeMirror.showHint;

CodeMirror.defineOption('hintOptions', null);
