Set ws = CreateObject("WScript.Shell")
ws.CurrentDirectory = "D:\桌面\Happy Alaa\desktop"
ws.Run "cmd /c npm start", 0, False
