from pathlib import Path
files=[Path("src/app/layout.tsx"), Path("src/components/owel-chatbot.tsx")]
for p in files:
    data = p.read_bytes()
    print("FILE", p)
    try:
        data.decode("utf-8")
        print("utf-8 decode ok", len(data), "bytes")
    except UnicodeDecodeError as e:
        print("utf-8 decode failed", e)
        start=max(0, e.start-20)
        end=min(len(data), e.start+20)
        print(data[start:end])
