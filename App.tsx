import React, { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createGame,
  deleteGame,
  joinGame,
  resetGame,
  subscribeToGame,
  updateGameState,
} from "./firebase/db";
import { BoardValue, Game, GameId, GameOutcome, UserId } from "./types";
import uuid from "react-native-uuid";
import LottieView from "lottie-react-native";

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [userId, setUserId] = useState<string | null>(null);
  const [turn, setTurn] = useState<UserId | null>(null);
  const [player1, setPlayer1] = useState<UserId | null>(null);
  const [player2, setPlayer2] = useState<UserId | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | UserId | null>(null);
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [winner, setWinner] = useState<UserId | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState<boolean>(false);
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    const onGameStateChange = (game: Game) => {
      if (userId) {
        setBoard(game.state);
        setOutcome(game.outcome);
        if (game.winner) {
          if (game.winner == userId) {
            confettiRef.current?.play(0);
          }
          setWinner(game.winner);
        }
        setTurn(game.turn);
        if (player2 == null) {
          setPlayer2(game.player2);
          setLoadingPlayer(game.player2 ? false : true);
        }
      }
    };
    if (gameId) {
      const unsubscribe = subscribeToGame(gameId, onGameStateChange);
      // Cleanup function to unsubscribe when the component unmounts
      return () => unsubscribe();
    }
  }, [gameId, userId, player2]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          const newUserId = uuid.v4().toString();
          await AsyncStorage.setItem("userId", newUserId);
          setUserId(newUserId);
        }
      } catch (error) {
        console.error("Failed to fetch or generate user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  const handlePress = useCallback(
    (index: number) => {
      if (board[index] !== null) return;
      if (turn != userId) return;
      if (!gameId) return;
      if (player1 && player2) {
        updateGameState({
          index: index,
          value: player1 === userId ? "X" : "O",
          gameId: gameId,
          opposing: userId === player1 ? player2 : player1,
        });
      }
    },
    [board, turn, gameId, player2, player1]
  );

  const handleReset = useCallback(() => {
    if (player1 && player2 && gameId) {
      resetGame(player1, player2, gameId);
    }
  }, [player1, player2, gameId]);

  const renderSquare = useCallback(
    ({ item, index }: { item: number | null; index: number }) => (
      <Pressable style={styles.square} onPress={() => handlePress(index)}>
        <Text style={styles.squareText}>{item}</Text>
      </Pressable>
    ),
    [board, turn]
  );

  const makeGame = useCallback(async () => {
    handleReset();
    if (userId) {
      const game = await createGame(userId);
      setGameId(game.id);
      setPlayer1(userId);
      setLoadingPlayer(true);
    }
  }, [userId]);

  const deleteExisting = useCallback(async () => {
    if (gameId) {
      await deleteGame(gameId);
      setGameId(null);
      setTurn(null);
      setPlayer1(null);
      setPlayer2(null);
      setOutcome(null);
    }
    setLoadingPlayer(false);
  }, [gameId]);

  const joinExisting = useCallback(async () => {
    if (userId) {
      const game = await joinGame(userId);
      if (game) {
        setGameId(game.id);
        setPlayer1(game.player1);
        setPlayer2(userId);
      }
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      {loadingPlayer && (
        <Modal animationType="slide" transparent={true} visible={loadingPlayer}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.waitStyle}>Waiting for Player</Text>
              <ActivityIndicator size="large" color="#0000ff" />
              <TouchableOpacity
                style={styles.buttonClose}
                onPress={deleteExisting}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {outcome === GameOutcome.IN_PROGRESS && (
        <Text style={styles.statusText}>
          {turn === userId ? "Your Turn" : "Opp Turn"}
        </Text>
      )}
      {outcome === GameOutcome.WIN && winner === userId && (
        <Text style={styles.winStatus}>You Win!</Text>
      )}
      {outcome === GameOutcome.WIN && winner !== userId && (
        <Text style={styles.loseStatus}>You Lose!</Text>
      )}
      {outcome === GameOutcome.TIE && (
        <Text style={styles.tieStatus}>Tie!</Text>
      )}
      <Text style={styles.title}>Tic Tac Toe</Text>
      <View style={styles.board}>
        <FlatList
          scrollEnabled={false}
          data={board}
          renderItem={renderSquare}
          numColumns={3}
        />
      </View>
      {(outcome === GameOutcome.TIE || outcome === GameOutcome.WIN) && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={makeGame}>
        <Text style={styles.resetButtonText}>Create Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resetButton} onPress={joinExisting}>
        <Text style={styles.resetButtonText}>Join Game</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
      <LottieView
        ref={confettiRef}
        source={require("./assets/confetti.json")}
        autoPlay={false}
        loop={false}
        style={styles.lottie}
        resizeMode="cover"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  square: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  squareText: {
    fontSize: 24,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  winStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
  loseStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  tieStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  lottie: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: "none",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  waitStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
});
