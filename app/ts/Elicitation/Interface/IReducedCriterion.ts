import {PVFDirection} from './IPVF';

export default interface IReducedCriterion {
  id: string;
  pvf: {
    range: [number, number];
    direction: PVFDirection;
    type: 'linear';
  };
}
