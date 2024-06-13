import { firestore } from "../firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Game,
  GameOutcome,
  BoardState,
  UserId,
  GameId,
  BoardValue,
} from "../types";
import { Alert } from "react-native";

/**
 * Creates a new game in Firestore with initial settings.
 * @param players Set of user IDs of the players.
 * @returns Promise<void>
 */
const createGame = async (playerID: UserId): Promise<Game> => {
  const initialBoardState: BoardState = Array(9).fill(null);

  const newGame: Game = {
    id: doc(collection(firestore, "games")).id,
    player1: playerID,
    player2: null,
    state: initialBoardState,
    outcome: null,
    turn: playerID, // Randomly assign who starts or could be decided by another logic
  };

  await setDoc(doc(firestore, "games", newGame.id), newGame);
  return newGame;
};

const joinGame = async (playerID: UserId): Promise<Game | null> => {
  const gamesCollection = collection(firestore, "games");
  const querySnapshot = await getDocs(
    query(gamesCollection, where("player2", "==", null))
  );
  const gameToJoin = querySnapshot.docs[0]; // Assuming we take the first available game where player2 is null

  if (gameToJoin) {
    const gameId = gameToJoin.id;
    const gameData = gameToJoin.data() as Game;
    const updatedGameData = {
      ...gameData,
      player2: playerID,
      turn: Math.random() < 0.5 ? gameData.player1 : playerID, // Randomly assign turn
      outcome: GameOutcome.IN_PROGRESS,
    };

    await setDoc(doc(firestore, "games", gameId), updatedGameData);
    return gameData;
  } else {
    Alert.alert("No Games Found");
  }
  return null;
};

/**
 * Subscribes to changes in the game state for a given game ID.
 * @param gameId The ID of the game to subscribe to.
 * @param onGameStateChange Callback function to handle changes in game state.
 * @returns Unsubscribe function to stop listening to changes.
 */
const subscribeToGame = (
  gameId: GameId,
  onGameStateChange: (game: Game) => void
) => {
  const gameRef = doc(firestore, "games", gameId);

  const unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const gameData = doc.data() as Game;
      onGameStateChange(gameData);
    } else {
      Alert.alert("No such game exists!");
    }
  });

  return unsubscribe;
};

const checkWinner = (board: Array<BoardValue>) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) {
    return GameOutcome.TIE;
  }
  return GameOutcome.IN_PROGRESS;
};

/**
 * Updates the game state at a specific index with a given value.
 * @param index The index in the game state array to update.
 * @param value The value to set at the specified index.
 * @param gameId The ID of the game to update.
 * @param userId The ID of the game to update.
 */
const updateGameState = async ({
  index,
  value,
  gameId,
  opposing,
}: {
  index: number;
  value: BoardValue;
  gameId: GameId;
  opposing: UserId;
}): Promise<void> => {
  const gameRef = doc(firestore, "games", gameId);
  const gameSnap = await getDoc(gameRef);
  if (gameSnap.exists()) {
    const gameData = gameSnap.data() as Game;
    const updatedState = [...gameData.state];
    updatedState[index] = value;

    const winner = checkWinner(updatedState);
    let winningPlayer = null;
    let outcome = gameData.outcome;
    if (winner === "X") {
      outcome = GameOutcome.WIN;
      winningPlayer = gameData.player1;
    } else if (winner === "O") {
      outcome = GameOutcome.WIN;
      winningPlayer = gameData.player2;
    } else if (winner === GameOutcome.TIE) {
      outcome = GameOutcome.TIE;
    } else {
      outcome = GameOutcome.IN_PROGRESS;
    }

    const updateData = {
      state: updatedState,
      turn: opposing,
      outcome: outcome,
    } as Game;

    if (winningPlayer !== null) {
      updateData.winner = winningPlayer;
    }
    await updateDoc(gameRef, updateData);
  } else {
    Alert.alert("Game not found");
  }
};

/**
 * Resets the game state and sets a random player's turn.
 * @param player1 The ID of the first player.
 * @param player2 The ID of the second player.
 * @param gameId The ID of the game to reset.
 */
const resetGame = async (
  player1: UserId,
  player2: UserId,
  gameId: GameId
): Promise<void> => {
  const gameRef = doc(firestore, "games", gameId);
  const gameSnap = await getDoc(gameRef);
  if (gameSnap.exists()) {
    const randomTurn = Math.random() < 0.5 ? player1 : player2;
    const initialBoardState: BoardState = Array(9).fill(null);

    const newGame: Game = {
      id: doc(collection(firestore, "games")).id,
      player1: player1,
      player2: player2,
      state: initialBoardState,
      outcome: GameOutcome.IN_PROGRESS,
      turn: randomTurn, // Randomly assign who starts or could be decided by another logic
    };
    await setDoc(doc(firestore, "games", gameId), newGame);
  } else {
    Alert.alert("Game not found");
  }
};
/**
 * Deletes a game from the database.
 * @param gameId The ID of the game to delete.
 */
const deleteGame = async (gameId: GameId): Promise<void> => {
  const gameRef = doc(firestore, "games", gameId);
  await deleteDoc(gameRef);
};

export {
  createGame,
  joinGame,
  subscribeToGame,
  updateGameState,
  resetGame,
  deleteGame,
};
