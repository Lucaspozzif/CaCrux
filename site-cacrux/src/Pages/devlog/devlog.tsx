import { useEffect, useState } from "react";
import { Client } from "../../Classes/client/client";

export function DevlogPage() {
  const [devlogs, setDevlogs] = useState<any>({});

  useEffect(() => {
    c.getDevlog().then((devlog: any) => {
      setDevlogs(devlog);
    });
  }, []);

  const c = new Client();
  console.log(devlogs);
  return (
    <div className=''>
      <p className='devlogTitle'>Devlog:</p>
      {Object.keys(devlogs).map((key: string) => {
        return (
          <div>
            <p className='title'>{key}</p>
            {devlogs[key].map((patch:any) => {
              return <li className='patch'>{patch}</li>;
            })}
          </div>
        );
      })}
    </div>
  );
}
