import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import LostItemFeePolicyDetail from '../../interactors/lost-item-fee-policy/lost-item-fee-policy-detail';

describe.only('LostItemFeePolicyDetail', () => {
  setupApplication({ scenarios: ['testLostItemFeePolicy'] });

  let lostItemPolicy;

  describe('viewing lost item fee policy', () => {
    describe('accordions', () => {
      beforeEach(function () {
        lostItemPolicy = this.server.create('lostItemFeePolicy');

        this.visit(`/settings/circulation/lost-item-fee-policy/${lostItemPolicy.id}`);
      });

      it('should be displayed', () => {
        expect(LostItemFeePolicyDetail.expandAll.isPresent).to.be.true;
      });

      describe('collapse all', () => {
        beforeEach(async () => {
          await LostItemFeePolicyDetail.lostItemDetails.clickHeader();
          await LostItemFeePolicyDetail.expandAll.click();
        });

        it('content should be hidden', () => {
          expect(LostItemFeePolicyDetail.content.isHidden).to.be.true;
        });

        describe('expand all', () => {
          beforeEach(async () => {
            await LostItemFeePolicyDetail.expandAll.click();
          });

          it('content should be visible', () => {
            expect(LostItemFeePolicyDetail.content.isVisible).to.be.true;
          });
        });
      });
    });

    describe('about section', () => {
      describe('lost item fee policy', () => {
        beforeEach(function () {
          lostItemPolicy = this.server.create('lostItemFeePolicy');

          this.visit(`/settings/circulation/lost-item-fee-policy/${lostItemPolicy.id}`);
        });


        describe('lost item fee policy name', () => {
          it('should be displayed', () => {
            expect(LostItemFeePolicyDetail.aboutSection.policyName.isPresent).to.be.true;
          });

          it('should have a proper value', () => {
            expect(LostItemFeePolicyDetail.aboutSection.policyName.value.text).to.equal(lostItemPolicy.name);
          });
        });

        describe('lost item fee policy description', () => {
          it('should be displayed', () => {
            expect(LostItemFeePolicyDetail.aboutSection.policyDescription.isPresent).to.be.true;
          });

          it('should have a proper value', () => {
            expect(LostItemFeePolicyDetail.aboutSection.policyDescription.value.text).to.equal(lostItemPolicy.description);
          });
        });
      });
    });

    describe('lost item fee section', () => {
      describe('lost item fee policy', () => {
        beforeEach(function () {
          lostItemPolicy = this.server.create('lostItemFeePolicy');

          this.visit(`/settings/circulation/lost-item-fee-policy/${lostItemPolicy.id}`);
        });

        describe('lost item fee section', () => {
          it('should not be displayed', () => {
            expect(LostItemFeePolicyDetail.lostItemSection.isPresent).to.be.true;
          });
        });
      });
    });
    describe('lost item fee section', () => {
      describe('lost item fee policy', () => {
        beforeEach(function () {
          lostItemPolicy = this.server.create('lostItemFeePolicy');

          this.visit(`/settings/circulation/lost-item-fee-policy/${lostItemPolicy.id}`);
        });

        describe('lost item fee section', () => {
          it('should not be displayed', () => {
            expect(LostItemFeePolicyDetail.lostItemSection.isPresent).to.be.true;
          });
        });
      });

      describe('lost item fee section', () => {
        describe('lost item fee policy', () => {
          beforeEach(function () {
            LostItemFeePolicyDetail.deleteLostItemFeePolicy.click();
          });

          describe('lost item fee section', () => {
            it('should not be displayed', () => {
              expect(LostItemFeePolicyDetail.expandAll.isPresent).to.be.true;
            });
          });
        });
      });
    });
  });
});
