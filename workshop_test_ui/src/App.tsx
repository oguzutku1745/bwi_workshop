import React, { useState } from "react";
import "./App.css";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";

function App() {
  const [publicAmount, setPublicAmount] = useState("");
  const [privateAmount, setPrivateAmount] = useState("");
  const [privateRecordJson, setPrivateRecordJson] = useState("");
  const [joinRecordA, setJoinRecordA] = useState("");
  const [joinRecordB, setJoinRecordB] = useState("");
  const [splitRecord, setSplitRecord] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [addressToCheck, setAddressToCheck] = useState("");
  const [buyPublicLoading, setBuyPublicLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkedAmount, setCheckedAmount] = useState<string | null>(null);
  const [recordProgramId, setRecordProgramId] = useState("credits.aleo");
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [fetchedRecords, setFetchedRecords] = useState<Array<{ plaintext: string; spent?: boolean }>>([]);
  const [buyPrivateLoading, setBuyPrivateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [splitLoading, setSplitLoading] = useState(false);

  // no-op removed; each form handles its own submit

  const { wallet, publicKey, requestRecordPlaintexts, requestTransaction } = useWallet();
  // Chain must match WalletProvider network (src/main.tsx uses Testnet).
  // Program workshop_test.aleo is deployed on Testnet (Provable explorer).
  // Use "testnet" for all createTransaction calls.


  function tryParseJSON<T = unknown>(input: string): T | string {
    try {
      return JSON.parse(input) as T;
    } catch {
      return input;
    }
  }

  async function handleBuyPublic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!requestTransaction) {
      alert("No wallet connected");
      return;
    }
    const parsed = Number(publicAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      alert("Enter a valid coffee amount (u8)");
      return;
    }
    setBuyPublicLoading(true);
    try {
      const result = await requestTransaction({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [
          {
            program: "workshop_test.aleo",
            functionName: "buy_public",
            inputs: [`${parsed}u8`],
          },
        ],
        fee: 100000,
        feePrivate: false,
      });
      setLastTxId(String(result));
    } catch (err) {
      console.error(err);
      alert("Transaction failed. See console for details.");
    } finally {
      setBuyPublicLoading(false);
    }
  }

  async function handleBuyPrivate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!publicKey || !wallet?.adapter) throw new WalletNotConnectedError();
    const amt = Number(privateAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      alert("Enter a valid coffee amount (u8)");
      return;
    }
    if (!privateRecordJson.trim()) {
      alert("Paste a credits.aleo/credits record JSON");
      return;
    }
    const recordInput = tryParseJSON(privateRecordJson);
    setBuyPrivateLoading(true);
    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        "testnetbeta",
        "workshop_test.aleo",
        "buy_private",
        [recordInput as any, `${amt}u8`],
        100000,
        false
      );
      const txId = await (wallet.adapter as any).requestTransaction(aleoTransaction);
      setLastTxId(String(txId));
    } catch (err) {
      console.error(err);
      alert("Private purchase failed. Check your record JSON and try again.");
    } finally {
      setBuyPrivateLoading(false);
    }
  }

  async function handleJoinRecords(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!publicKey || !wallet?.adapter) throw new WalletNotConnectedError();
    if (!joinRecordA.trim() || !joinRecordB.trim()) {
      alert("Paste two credits.aleo/credits records (JSON)");
      return;
    }
    const a = tryParseJSON(joinRecordA);
    const b = tryParseJSON(joinRecordB);
    setJoinLoading(true);
    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        "testnetbeta",
        "workshop_test.aleo",
        "combine_records",
        [a as any, b as any],
        100000,
        false
      );
      const txId = await (wallet.adapter as any).requestTransaction(aleoTransaction);
      setLastTxId(String(txId));
    } catch (err) {
      console.error(err);
      alert("Join failed. Check your record JSONs and try again.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleSplitRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!publicKey || !wallet?.adapter) throw new WalletNotConnectedError();
    if (!splitRecord.trim()) {
      alert("Paste a credits.aleo/credits record (JSON)");
      return;
    }
    const amount = Number(splitAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid split amount (u64)");
      return;
    }
    const rec = tryParseJSON(splitRecord);
    setSplitLoading(true);
    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        "testnetbeta",
        "workshop_test.aleo",
        "split_records",
        [rec as any, `${amount}u64`],
        100000,
        false
      );
      const txId = await (wallet.adapter as any).requestTransaction(aleoTransaction);
      setLastTxId(String(txId));
    } catch (err) {
      console.error(err);
      alert("Split failed. Check your record JSON and try again.");
    } finally {
      setSplitLoading(false);
    }
  }

  return (
    <main className="app-container">
      <header className="header">
        <div className="brand">
          <span className="brand-emoji" aria-hidden>
            ☕
          </span>
          <h1 className="brand-title">Aleo Coffee Workshop</h1>
        </div>
        <WalletMultiButton className="wallet-btn" />
      </header>

      <section className="intro">
        <p className="muted">
          UI for coffee actions. Connect your wallet to prepare for the
          workshop. 
        </p>
      </section>

      <section className="actions-grid">
        <div className="action-card">
          <h2 className="action-title">Buy a coffee publicly</h2>
          <p className="action-subtitle muted">Provide the coffee amount.</p>
          <form onSubmit={handleBuyPublic} className="form">
            <div className="field">
              <label htmlFor="public-amount" className="label">
                Coffee amount
              </label>
              <input
                id="public-amount"
                className="input"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="e.g., 1"
                value={publicAmount}
                onChange={(e) => setPublicAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={buyPublicLoading}>
              {buyPublicLoading ? "Submitting..." : "Buy Publicly"}
            </button>
            {lastTxId ? (
              <p className="muted" style={{ margin: 0 }}>
                Submitted. Track in wallet. Tx: {lastTxId}
              </p>
            ) : null}
          </form>
        </div>

        <div className="action-card">
          <h2 className="action-title">Buy a coffee privately</h2>
          <p className="action-subtitle muted">Paste a credits.aleo/credits record and amount.</p>
          <form onSubmit={handleBuyPrivate} className="form">
            <div className="field">
              <label htmlFor="private-record" className="label">Record JSON</label>
              <textarea
                id="private-record"
                className="textarea"
                rows={4}
                placeholder='record input'
                value={privateRecordJson}
                onChange={(e) => setPrivateRecordJson(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="private-amount" className="label">Coffee amount</label>
              <input
                id="private-amount"
                className="input"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="e.g., 1"
                value={privateAmount}
                onChange={(e) => setPrivateAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={buyPrivateLoading}>
              {buyPrivateLoading ? "Submitting..." : "Buy Privately"}
            </button>
          </form>
        </div>

        <div className="action-card">
          <h2 className="action-title">Join your records</h2>
          <p className="action-subtitle muted">Provide two record inputs.</p>
          <form onSubmit={handleJoinRecords} className="form">
            <div className="field">
              <label htmlFor="join-record-a" className="label">
                Record #1
              </label>
              <textarea
                id="join-record-a"
                className="textarea"
                rows={4}
                placeholder="Paste your first record here"
                value={joinRecordA}
                onChange={(e) => setJoinRecordA(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="join-record-b" className="label">
                Record #2
              </label>
              <textarea
                id="join-record-b"
                className="textarea"
                rows={4}
                placeholder="Paste your second record here"
                value={joinRecordB}
                onChange={(e) => setJoinRecordB(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={joinLoading}>
              {joinLoading ? "Submitting..." : "Join Records"}
            </button>
          </form>
        </div>

        <div className="action-card">
          <h2 className="action-title">Split your record</h2>
          <p className="action-subtitle muted">Provide one record and the amount to split.</p>
          <form onSubmit={handleSplitRecord} className="form">
            <div className="field">
              <label htmlFor="split-record" className="label">
                Record
              </label>
              <textarea
                id="split-record"
                className="textarea"
                rows={4}
                placeholder="Paste the record to split"
                value={splitRecord}
                onChange={(e) => setSplitRecord(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="split-amount" className="label">
                Amount
              </label>
              <input
                id="split-amount"
                className="input"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="e.g., 1"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={splitLoading}>
              {splitLoading ? "Submitting..." : "Split Record"}
            </button>
          </form>
        </div>

        <div className="action-card full-row">
          <h2 className="action-title">Check coffee amount of a person</h2>
          <p className="action-subtitle muted">Provide an address.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!addressToCheck) {
                alert("Enter an Aleo address");
                return;
              }
              setCheckLoading(true);
              setCheckedAmount(null);
              try {
                const resp = await fetch(
                  `https://api.aleoscan.io/v3/mapping/get_value/workshop_test.aleo/total_coffee/${addressToCheck}`
                );
                if (!resp.ok) throw new Error("Failed to query mapping");
                const data = await resp.json();
                const value: string | undefined = data?.value;
                setCheckedAmount(value ?? "0u8");
              } catch (err) {
                console.error(err);
                alert("Unable to read mapping value right now.");
              } finally {
                setCheckLoading(false);
              }
            }}
            className="form row"
          >
            <div className="field grow">
              <label htmlFor="check-address" className="label">
                Address
              </label>
              <input
                id="check-address"
                className="input"
                type="text"
                placeholder="aleo1..."
                value={addressToCheck}
                onChange={(e) => setAddressToCheck(e.target.value)}
              />
            </div>
            <div className="field align-end">
              <label className="label hidden" htmlFor="check-submit">
                Submit
              </label>
              <button id="check-submit" type="submit" className="primary-btn" disabled={checkLoading}>
                {checkLoading ? "Checking..." : "Check Amount"}
              </button>
            </div>
          </form>
          {checkedAmount !== null ? (
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              Total coffee: {checkedAmount}
            </p>
          ) : null}
        </div>

        <div className="action-card full-row">
          <h2 className="action-title">Your records (fetch & copy)</h2>
          <p className="action-subtitle muted">
            Fetch your plaintext records from a program (default: credits.aleo) and copy-paste them into the actions above.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!requestRecordPlaintexts) {
                alert("No wallet connected");
                return;
              }
              setRecordsLoading(true);
              setFetchedRecords([]);
              try {
                const recs = await requestRecordPlaintexts(recordProgramId);
                // Prefer unspent
                const unspent = Array.isArray(recs) ? recs.filter((r: any) => !r?.spent) : [];
                const normalized = (unspent.length > 0 ? unspent : recs || []).map((r: any) => ({
                  plaintext: r?.plaintext ?? String(r ?? ""),
                  spent: Boolean(r?.spent),
                }));
                setFetchedRecords(normalized);
              } catch (err) {
                console.error(err);
                alert("Could not fetch records.");
              } finally {
                setRecordsLoading(false);
              }
            }}
            className="form"
          >
            <div className="field">
              <label htmlFor="record-program" className="label">Program ID</label>
              <input
                id="record-program"
                className="input"
                type="text"
                placeholder="e.g., credits.aleo"
                value={recordProgramId}
                onChange={(e) => setRecordProgramId(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={recordsLoading}>
              {recordsLoading ? "Fetching..." : "Fetch Records"}
            </button>
          </form>

          {fetchedRecords.length > 0 ? (
            <div className="form" style={{ marginTop: "0.75rem" }}>
              {fetchedRecords.map((r, idx) => (
                <div className="field" key={idx}>
                  <label className="label">Record #{idx + 1}{r.spent ? " (spent)" : ""}</label>
                  <textarea className="textarea" rows={4} readOnly value={r.plaintext} />
                  <div>
                    <button
                      className="primary-btn"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(r.plaintext);
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="footer muted">
        Made with ❤️ by KyaTzu
      </footer>
    </main>
  );
}

export default App;


