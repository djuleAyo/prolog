export const errorPathBeggining = <div className="error">
  <h3>⚠️ Error ⚠️</h3>
  <p>Start path with a word</p>
</div>

const msgType = ["error", 'success'] as const;
export type MsgType = typeof msgType[number]

export const Msg = ({msg, type }: {msg: string, type: MsgType}) => <div className={type}>
  <h3>{type === "error" ? "⚠️" : "✅"} {type} {type === "error" ? "⚠️" : "✅"}</h3>
  <p>{msg}</p>
</div>

export const WelcomeMessage = <>
  <h3>👋 Welcome to Docsierra!</h3>

  <p>It was about for something entierly new ⚡</p>
</>