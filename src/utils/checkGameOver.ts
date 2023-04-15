import IChecker from "../interface/IChecker";
const MIN_VALID_ID = 0;
const MAX_VALID_ID = 2;

let iteration = 0;

const checkGameOver = (
  checkers: Array<Array<IChecker>>,
  lastChecker: IChecker
): boolean => {
  let gameOver = false;
  // Find whether the last checker was type O or X
  // const type: string = lastChecker.type;
  gameOver = checkVertical(checkers, lastChecker);
  if (gameOver) return gameOver;
  gameOver = checkHorizontal(checkers, lastChecker);
  if (gameOver) return gameOver;
  gameOver = checkDiagonalI(checkers, lastChecker);
  if (gameOver) return gameOver;
  gameOver = checkDiagonalII(checkers, lastChecker);
  return gameOver;
};

const checkVertical = (
  checkers: Array<Array<IChecker>>,
  lastChecker: IChecker,
  consecutiverCheckersCount: number = 1
): boolean => {
  let i = 1,
    direction = iteration % 2 === 0 ? 1 : -1;
  const [row, col] = [
    parseInt(lastChecker.id.split("")[0]),
    parseInt(lastChecker.id.split("")[1]),
  ];

  let rowToCheck = row + i * direction;

  while (rowToCheck >= MIN_VALID_ID && rowToCheck <= MAX_VALID_ID) {
    const nextChecker = checkers[rowToCheck][col];

    if (nextChecker.disabled && nextChecker.type === lastChecker.type)
      consecutiverCheckersCount++;
    if (consecutiverCheckersCount === 3) break;

    i++;
    rowToCheck = row + i * direction;
  }
  iteration++;

  if (iteration % 2 === 0) return consecutiverCheckersCount === 3;
  else return checkVertical(checkers, lastChecker, consecutiverCheckersCount);
};

const checkHorizontal = (
  checkers: Array<Array<IChecker>>,
  lastChecker: IChecker,
  consecutiverCheckersCount: number = 1
): boolean => {
  let i = 1,
    direction = iteration % 2 === 0 ? 1 : -1;
  const [row, col] = [
    parseInt(lastChecker.id.split("")[0]),
    parseInt(lastChecker.id.split("")[1]),
  ];
  let colToCheck = col + i * direction;

  while (colToCheck >= MIN_VALID_ID && colToCheck <= MAX_VALID_ID) {
    const nextChecker = checkers[row][colToCheck];

    if (nextChecker.disabled && nextChecker.type === lastChecker.type)
      consecutiverCheckersCount++;
    if (consecutiverCheckersCount === 3) break;

    i++;
    colToCheck = col + i * direction;
  }
  iteration++;

  if (iteration % 2 === 0) return consecutiverCheckersCount === 3;
  else return checkHorizontal(checkers, lastChecker, consecutiverCheckersCount);
};

// Diagonal \
const checkDiagonalI = (
  checkers: Array<Array<IChecker>>,
  lastChecker: IChecker,
  consecutiverCheckersCount: number = 1
): boolean => {
  let i = 1,
    direction = iteration % 2 === 0 ? 1 : -1;
  const [row, col] = [
    parseInt(lastChecker.id.split("")[0]),
    parseInt(lastChecker.id.split("")[1]),
  ];
  let rowToCheck = row + i * direction;
  let colToCheck = col + i * direction;

  while (
    rowToCheck >= MIN_VALID_ID &&
    rowToCheck <= MAX_VALID_ID &&
    colToCheck >= MIN_VALID_ID &&
    colToCheck <= MAX_VALID_ID
  ) {
    const nextChecker = checkers[rowToCheck][colToCheck];

    if (nextChecker.disabled && nextChecker.type === lastChecker.type)
      consecutiverCheckersCount++;
    if (consecutiverCheckersCount === 3) break;

    i++;
    rowToCheck = row + i * direction;
    colToCheck = col + i * direction;
  }
  iteration++;

  if (iteration % 2 === 0) return consecutiverCheckersCount === 3;
  else return checkDiagonalI(checkers, lastChecker, consecutiverCheckersCount);
};

// Diagonal /
const checkDiagonalII = (
  checkers: Array<Array<IChecker>>,
  lastChecker: IChecker,
  consecutiverCheckersCount: number = 1
): boolean => {
  let i = 1,
    direction = iteration % 2 === 0 ? 1 : -1;
  const [row, col] = [
    parseInt(lastChecker.id.split("")[0]),
    parseInt(lastChecker.id.split("")[1]),
  ];
  let rowToCheck = row - i * direction;
  let colToCheck = col + i * direction;

  while (
    rowToCheck >= MIN_VALID_ID &&
    rowToCheck <= MAX_VALID_ID &&
    colToCheck >= MIN_VALID_ID &&
    colToCheck <= MAX_VALID_ID
  ) {
    const nextChecker = checkers[rowToCheck][colToCheck];

    if (nextChecker.disabled && nextChecker.type === lastChecker.type)
      consecutiverCheckersCount++;
    if (consecutiverCheckersCount === 3) break;

    i++;
    rowToCheck = row - i * direction;
    colToCheck = col + i * direction;
  }
  iteration++;

  if (iteration % 2 === 0) return consecutiverCheckersCount === 3;
  else return checkDiagonalII(checkers, lastChecker, consecutiverCheckersCount);
};

export default checkGameOver;
