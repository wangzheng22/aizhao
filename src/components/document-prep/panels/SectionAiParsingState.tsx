import { useEffect, useState } from 'react';
import './SectionAiParsingState.css';

const PARSE_STAGE_MESSAGES = ['文件接收中', '深度分析中', '信息抽提中'] as const;
const STAGE_INTERVAL_MS = 1500;

type SectionAiParsingStateProps = {
  sectionTitle?: string;
};

export function SectionAiParsingState({ sectionTitle }: SectionAiParsingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % PARSE_STAGE_MESSAGES.length);
    }, STAGE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [sectionTitle]);

  const message = PARSE_STAGE_MESSAGES[messageIndex];

  return (
    <div className="section-ai-parse" role="status" aria-live="polite" aria-busy="true">
      <span className="section-ai-parse__avatar-wrap">
        <img
          className="section-ai-parse__avatar"
          src={`${import.meta.env.BASE_URL}icons/ai-ip.png`}
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
        />
      </span>
      <p className="section-ai-parse__message" key={message}>
        {message}…
      </p>
    </div>
  );
}
