import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export function addActivity(type: "add" | "delete", collectionName: string, itemId: string, itemTitle: string) {
  addDoc(collection(db, "activityLog"), {
    type,
    collection: collectionName,
    itemId,
    itemTitle,
    createdAt: serverTimestamp(),
  }).catch(() => {})
}
