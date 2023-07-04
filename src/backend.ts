// Axios instance with mindplug auth
import axios from 'axios';

const dev = 'http://localhost:3000';
const prod = 'https://backend.maildub.club';


const backendData = (userId: string) => axios.create({
    baseURL: `${prod}/api`,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer maildubInternal ${userId}`,
  },
});

 export default backendData; 