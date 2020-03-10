const getRoom = () => {
  return '5df5232ed0a5a4037bdc0756'; // server id
};

const socket = io();

socket.emit('join', getRoom(), () => {
  console.log('joined room', getRoom());
});

socket.on('logs', (data) => {
  console.log('logs', data);
});

socket.on('status', (status) => {
  console.log('status', status);
});