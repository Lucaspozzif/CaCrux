import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebase/firebase";

export class Client {
  private async createDay(day: string) {
    const formattedDay = day.replace(/\//g, "-");
    const ref = doc(db, "agendamento", formattedDay);
    const snap = await getDoc(ref);

    if (snap.exists()) return;
    await setDoc(ref, {});
  }

  public async addHour(day: string, hour: string) {
    const formattedDay = day.replace(/\//g, "-");
    const ref = doc(db, "agendamento", formattedDay);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await this.createDay(day);
    }
    await updateDoc(ref, { [hour]: {} });
  }

  public async getDay(day: string) {
    const formattedDay = day.replace(/\//g, "-");
    const docRef = doc(db, "agendamento", formattedDay);
    const docSnap = await getDoc(docRef);
    if (!docSnap.data()) return;

    return docSnap.data();
  }

  public async deleteUser(day: string, hour: string, number: string) {
    const formattedNumber = `55${number}`;
    const formattedDay = day.replace(/\//g, "-");
    const ref = doc(db, "agendamento", formattedDay);
    const snap = await getDoc(ref);

    var data = snap.data()?.[hour];
    delete data[formattedNumber];

    console.log(data);
    await updateDoc(ref, {
      [hour]: data,
    });
  }

  public async regUser(day: string, hour: string, name: string, number: string) {
    const formattedNumber = `55${number}`;
    const formattedDay = day.replace(/\//g, "-");
    const ref = doc(db, "agendamento", formattedDay);
    const snap = await getDoc(ref);

    var data = snap.data()?.[hour];
    data[formattedNumber] = {
      name: name,
      confirmed: false,
      messageSent: false,
    };

    console.log(data);
    await updateDoc(ref, {
      [hour]: data,
    });
  }

  public async getDevlog() {
    const docRef = doc(db, "config", "devlog");
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.data()) return;
    return docSnap.data();
  }
}
