export const formatDate = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return '--';
  // Parse date safely
  const date = new Date(dateInput);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '--';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatTime = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return '--';
  
  const date = new Date(dateInput);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '--';

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  
  return `${hours}:${strMinutes} ${ampm}`;
};

export const formatDuration = (minutes: number, isRunning: boolean = false): string => {
  if (isRunning) return 'Running...';
  if (minutes === 0) return '0h 00m';
  
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};