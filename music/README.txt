=== HOW TO ADD YOUR OWN SONGS ===

1. Put your MP3 files in this folder (music/)

2. Open game.html, find line with "const SONGS = ["

3. Add entries like this:

const SONGS = [
  {
    f: 'music/your-song.mp3',       // file path
    t: 'Song Title',                 // display name
    l: "[00:00.00]First lyric line\n[00:05.00]Second line\n[00:10.00]Third line"
  },
  {
    f: 'music/another-song.mp3',
    t: 'Another Song',
    l: "[00:00.00]Lyric one\n[00:04.00]Lyric two"
  },
];

LRC FORMAT: [minutes:seconds.hundredths]Lyric text
Example: [00:12.50]This appears at 12.5 seconds

Each \n separates a new lyric line with its own timestamp.
