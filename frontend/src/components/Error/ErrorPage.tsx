import { useNavigate } from "react-router-dom";

const Error = () => {
	const navigate = useNavigate();

	const queryString = window.location.search;

	const urlParams = new URLSearchParams(queryString);

	const statusCode = urlParams.get('statusCode');
	const statusCode2 = statusCode === null ? '404' : statusCode;
	const errorMsg = statusCode2 === '404' ? "Page not found" : urlParams.get('message');

	return (
		<div>
			<p>{ "Error " + statusCode2 + "!" }</p>
			<p>{ errorMsg }</p>
			<button className="navy-button" onClick={() => navigate('/')}>Back to Home</button>
		</div>
	);
}

export default Error;