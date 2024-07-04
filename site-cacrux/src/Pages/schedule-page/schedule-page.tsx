import { useEffect, useState } from "react";
import { Client } from "../../Classes/client/client";
import { useNavigate } from "react-router-dom";

export function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedReg, setSelectedReg] = useState<any>();
  const [data, setData] = useState<any[]>([]);
  const [expanded, setExpanded] = useState([""]);

  const [regName, setRegName] = useState("");
  const [regNumber, setRegNumber] = useState("");

  const days: string[] = [];
  const hours: string[] = [];

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  for (let i = 0; i <= 30; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    days.push(day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }));
  }
  for (let i = 17; i < 24; i++) {
    hours.push(`${i}:00`, `${i}:15`, `${i}:30`, `${i}:45`);
  }

  const c = new Client();

  const fetchData = async () => {
    try {
      const promises = days.map(async (day) => await c.getDay(day));
      const results = await Promise.all(promises);
      setData(results);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setLoading(false);
    }
  };

  const tabHandler = () => {
    switch (tab) {
      case 0: // Home page
        return (
          <div className='tab'>
            <p className='back' onClick={() => navigate("/")}>
              voltar
            </p>
            <div className='button' onClick={() => setTab(1)}>
              <p className='title'>Adicionar novo Horário</p>
            </div>
            {days.map((day: string, index) => {
              if (data[index] !== undefined)
                return (
                  <div
                    key={index}
                    className='button'
                    onClick={() => {
                      setSelectedIndex(index);
                      setSelectedDay(day);
                      setTab(3);
                    }}
                  >
                    {day}
                  </div>
                );
            })}
          </div>
        );
      case 1:
        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setExpanded([]);
                setTab(0);
              }}
            >
              voltar
            </p>
            {days.map((day: string, index) => {
              if (!expanded.includes(day))
                return (
                  <div
                    className='button'
                    onClick={() => {
                      setExpanded([...expanded, day]);
                    }}
                  >
                    {day}
                  </div>
                );
              return (
                <div>
                  {hours.map((hour) => {
                    if (data[index]?.[hour] == undefined)
                      return (
                        <div
                          onClick={() => {
                            setSelectedDay(day);
                            setSelectedHour(hour);
                            setExpanded([]);
                            setTab(2);
                          }}
                        >
                          <p className='button'>
                            {day} - {hour}
                          </p>
                        </div>
                      );
                  })}
                </div>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setSelectedDay("");
                setSelectedHour("");
                setTab(1);
              }}
            >
              voltar
            </p>
            <p>
              {selectedDay} - {selectedHour}
            </p>
            <div
              className='button'
              onClick={async () => {
                setLoading(true);
                await c.addHour(selectedDay, selectedHour);
                await fetchData();
                setLoading(false);
                setSelectedDay("");
                setSelectedHour("");
                setTab(0);
              }}
            >
              <p className='title'>Confirmar Criação de horário</p>
            </div>
            <div
              className='button'
              onClick={() => {
                setTab(0);
                setSelectedDay("");
                setSelectedHour("");
              }}
            >
              <p className='title'>Cancelar</p>
            </div>
          </div>
        );
      case 3:
        const timeToComparable = (time: any) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes; // Convert time to total minutes
        };

        // Sort times array using the timeToComparable function
        const sortedHours = Object.keys(data[selectedIndex]).sort((a, b) => {
          const timeA = timeToComparable(a);
          const timeB = timeToComparable(b);
          return timeA - timeB; // Sort by total minutes
        });

        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setSelectedIndex(-1);
                setSelectedDay("");
                setTab(0);
              }}
            >
              voltar
            </p>
            <p className='title'>{selectedDay}</p>
            <div
              className='button'
              onClick={() => {
                setTab(1);
              }}
            >
              <p className='title'>Adicionar novo Horário</p>
            </div>
            {sortedHours.map((hour: string) => {
              return (
                <div
                  className='button'
                  onClick={() => {
                    setSelectedHour(hour);
                    setTab(4);
                  }}
                >
                  {hour}
                </div>
              );
            })}
          </div>
        );
      case 4:
        const entries: any = Object.entries(data[selectedIndex][selectedHour]);
        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setTab(3);
                setSelectedHour("");
              }}
            >
              voltar
            </p>
            <p className='title'>
              {selectedDay} - {selectedHour}
            </p>
            <div
              className='button'
              onClick={() => {
                setTab(5);
              }}
            >
              <p className='title'>Adicionar novo Agendado</p>
            </div>
            {entries.map((data: any) => {
              const unformattedNumber = data[0].slice(2);
              var unformattedData = data;
              unformattedData[0] = unformattedNumber;
              return (
                <div
                  className='button'
                  onClick={() => {
                    setTab(6);
                    setRegName(data[1]["name"]);
                    setRegNumber(unformattedNumber);
                    setSelectedReg(unformattedData);
                  }}
                >
                  {data[1]["name"]} {data[1]["messageSent"] ? (data[1]["confirmed"] ? "- Confirmado" : "- Mensagem Enviada") : ""}
                </div>
              );
            })}
          </div>
        );
      case 5:
        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setTab(4);
              }}
            >
              voltar
            </p>
            <p className='title'>Agendamento</p>
            <input
              placeholder='nome'
              value={regName}
              onChange={(e) => {
                setRegName(e.target.value);
              }}
            />
            <input
              className='input-container astronomy'
              placeholder='numero de telefone'
              value={regNumber}
              onChange={(e) => {
                setRegNumber(e.target.value);
              }}
            />
            <div
              className='button'
              onClick={async () => {
                setLoading(true);
                setTab(4);
                await c.regUser(selectedDay, selectedHour, regName, regNumber);
                await fetchData();
                setRegName("");
                setRegNumber("");
                setLoading(false);
              }}
            >
              <p className='title'>Confirmar</p>
            </div>
            <div
              className='button'
              onClick={() => {
                setRegName("");
                setRegNumber("");
                setTab(4);
              }}
            >
              <p className='title'>Cancelar</p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className='tab'>
            <p
              className='back'
              onClick={() => {
                setTab(4);
                setSelectedReg("");
              }}
            >
              voltar
            </p>
            <p className='title'>{selectedReg[1]["name"]}</p>

            <input
              placeholder='nome'
              value={regName}
              onChange={(e) => {
                setRegName(e.target.value);
              }}
            />
            <input
              className='input-container astronomy'
              placeholder='numero de telefone'
              value={regNumber}
              onChange={(e) => {
                setRegNumber(e.target.value);
              }}
            />
            <div
              className='button'
              onClick={async () => {
                setLoading(true);
                await c.deleteUser(selectedDay, selectedHour, selectedReg[0]);
                await c.regUser(selectedDay, selectedHour, regName, regNumber);
                await fetchData();
                setLoading(false);
                setTab(4);
              }}
            >
              Salvar Edições
            </div>
            <div
              className='button'
              onClick={async () => {
                setLoading(true);
                await c.deleteUser(selectedDay, selectedHour, selectedReg[0]);
                await fetchData();
                setLoading(false);
                setTab(4);
              }}
            >
              Excluir Inscrição
            </div>
          </div>
        );
      default:
        return <p>Error</p>;
    }
  };

  return loading ? <div>carregando...</div> : tabHandler();
}
