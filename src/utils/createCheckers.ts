import IChecker from "../interface/IChecker";

const createCheckers = () => {
  const checkers: Array<Array<IChecker>> = [];
  for (let i = 0; i < 3; i++) {
    const row: Array<IChecker> = [];
    for (let j = 0; j < 3; j++) {
      const checker: IChecker = {
        showX: false,
        showO: false,
        disabled: false,
        id: `${i}${j}`,
      };
      row.push(checker);
    }
    checkers.push(row);
  }
  return checkers;
};

export default createCheckers;
