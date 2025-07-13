import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase/config";
import type { CombinedGameState } from "../contexts/GameContext";

export interface CloudSaveData {
  gameState: CombinedGameState;
  lastSaved: any; // serverTimestamp
  version: string;
}

export class CloudSaveService {
  private static readonly COLLECTION_NAME = "shawarma_saves";
  private static readonly SAVE_VERSION = "2.0";

  // Save game state to Firestore
  static async saveToCloud(
    user: User,
    gameState: CombinedGameState
  ): Promise<void> {
    try {
      const saveData: CloudSaveData = {
        gameState,
        lastSaved: serverTimestamp(),
        version: this.SAVE_VERSION,
      };

      await setDoc(doc(db, this.COLLECTION_NAME, user.uid), saveData);
      console.log("Game saved to cloud successfully");
    } catch (error) {
      console.error("Error saving to cloud:", error);
      throw error;
    }
  }

  // Load game state from Firestore
  static async loadFromCloud(user: User): Promise<CombinedGameState | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CloudSaveData;
        console.log("Game loaded from cloud successfully");
        return data.gameState;
      } else {
        console.log("No cloud save found for user");
        return null;
      }
    } catch (error) {
      console.error("Error loading from cloud:", error);
      throw error;
    }
  }

  // Check if cloud save exists
  static async hasCloudSave(user: User): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking cloud save:", error);
      return false;
    }
  }
}
