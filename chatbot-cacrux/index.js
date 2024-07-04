const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { db } = require("./Services/firebase.js");
const { doc, getDoc, updateDoc } = require("firebase/firestore");
const shrek = require("./shrek.js");

class Bot {
  nextDay() {
    const d = new Date(new Date().setDate(new Date().getDate() + 1));
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)}`;
  }

  async getDay() {
    const ref = doc(db, "agendamento", this.nextDay());
    const snap = await getDoc(ref);
    if (!snap.data()) {
      return {};
    }
    return snap.data();
  }

  async getNumbers() {
    const rawData = await this.getDay();
    return Object.entries(rawData).flatMap(([hour, profiles]) =>
      Object.entries(profiles)
        .filter(([, profile]) => !profile.messageSent)
        .map(([number, profile]) => ({ number, name: profile.name, hour }))
    );
  }

  async updateContact(info, messageSent, confirmed) {
    const formattedDay = this.nextDay().replace(/\//g, "-");
    const ref = doc(db, "agendamento", formattedDay);
    const snap = await getDoc(ref);

    var data = snap.data()?.[info["hour"]];
    data[info["number"]] = {
      name: info["name"],
      confirmed: confirmed,
      messageSent: messageSent,
    };

    await updateDoc(ref, {
      [info["hour"]]: data,
    });
  }

  sendMessages() {
    this.getNumbers().then((numbers) => {
      let index = 0;
      try {
        const sendMessage = () => {
          if (index < numbers.length) {
            const data = numbers[index];
            const message = `Olá ${data["name"]}, estou enviando esta mensagem para confirmar sua presença na observação astronômica amanhã com o projeto COAstro às ${data["hour"]}.`;
            console.log(`enviando mensagem para ${data["name"]} (${data["number"]})...`);
            client.sendMessage(`${data["number"]}@c.us`, message);
            this.updateContact(data, true, false);
            console.log(`Enviado`);

            index++;
            setTimeout(sendMessage, 2000);
          }
        };
        sendMessage();
      } catch (error) {
        console.log(error);
      }
    });
  }
}
const bot = new Bot();
const client = new Client({
  authStrategy: new LocalAuth(),
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  const version = await client.getWWebVersion();
  console.log(`WWeb v${version}`);

  bot.sendMessages();
  setInterval(() => {
    console.log("enviando...");
    bot.sendMessages();
  }, 6 * 60 * 60 * 1000);
});

client.initialize();
