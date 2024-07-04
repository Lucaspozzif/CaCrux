import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [devlog, setDevlog] = useState(0);

  const navigate = useNavigate();

  return (
    <div className='tab'>
      <div
        className='button'
        onClick={() => {
          navigate("/coastro");
        }}
      >
        <p className='title'>Agendar Coastro</p>
      </div>
      <p
        className='version'
        onClick={() => {
          if (devlog < 10) setDevlog(devlog + 1);
          else navigate("/devlog");
        }}
      >
        v0.1.1-alpha
      </p>
    </div>
  );
}
