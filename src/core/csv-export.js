function escapeCsvCell(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildHabitsCsv(habitList) {
  const rows = [['habit_id', 'name', 'category', 'track_type', 'date', 'value', 'target', 'unit', 'progress', 'current_streak']];

  for (const habit of habitList) {
    const history = [...new Set(habit.history || [])].sort();
    const target = habit.trackType === 'quantity'
      ? (habit.target ?? habit.quantityTarget ?? '')
      : 1;
    for (const date of history) {
      let value = 1;
      if (habit.trackType === 'quantity' && habit.dailyProgress && habit.dailyProgress[date] !== undefined) {
        value = habit.dailyProgress[date];
      }
      rows.push([
        habit.id,
        habit.treeName || habit.name,
        habit.category || '',
        habit.trackType || 'binary',
        date,
        value,
        target,
        habit.unit || '',
        habit.progress ?? 0,
        habit.currentStreak ?? 0
      ]);
    }
  }

  return `${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}\n`;
}

export function downloadCsvFile(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
