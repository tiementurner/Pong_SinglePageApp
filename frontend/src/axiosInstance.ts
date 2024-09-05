import axios from 'axios';

// We moeten deze axios instance in andere files importen zodat er bij alle axios 
//requests de credentials(session) wordt toegevoegd
const axiosInstance = axios.create({
    withCredentials: true
});

let hasRedirected = false;

axiosInstance.interceptors.response.use(
	response => response,
	error => {
		if (hasRedirected) {
			// If a redirect has already happened, just return the rejected promise in case of aborted requests.
			return Promise.reject(error);
		}
		
		if (window.location.pathname !== '/error' && window.location.pathname !== '/login') {
			if (error.response) {
				if (error.response.status === 401 && window.location.pathname !== '/TwoFactorAuth') {
					hasRedirected = true;			
					window.location.href = '/login';
				} else if (error.response.status >= 500) {
					hasRedirected = true;
					window.location.href = `/error?statusCode=${error.response.status}&message=${error.response.statusText}`;
				}
				console.log("error " + error.response.status + ", " + error.response.data.message);
			} else if (error.request) {
				hasRedirected = true;
				window.location.href = `/error?statusCode=${""}&message=${'Request did not receive a response'}`;
			} else {
				hasRedirected = true;
				window.location.href = `/error?statusCode=${""}&message=${'Something went wrong!'}`;
			}
		}
  
	  return Promise.reject(error);
	}
  );


export default axiosInstance