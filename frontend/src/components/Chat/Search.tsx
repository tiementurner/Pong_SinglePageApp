import {
	useSearchParams,
	useNavigate } from "react-router-dom"
import {
	useEffect,
	useState,
	FormEvent } from "react";

import { FaSearch } from "react-icons/fa";

import axios from "../../axiosInstance";
import { Modal } from "../ModalPortal";
import {
	PublicJoin,
	PrivateJoin } from "./JoinChannel";
import { ChannelSearchResultInfo as ResultInfo } from "../../Types";

export const SearchBar = () => {
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();

	const handleChange = (value: string) => {
		setInput(value);
	}
	
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const searchTerm = input;
		setInput("");
		navigate("/chat/search")
		setSearchParams({"query": searchTerm}, {replace: true});
	}

	return (
		<form className="channel-search-bar" id="channel-search-bar" onSubmit={handleSubmit}>
				<input type="text"
					placeholder=" search channels"
					name="search-bar"
					value={input}
					onChange={(e) => handleChange(e.target.value)}/>
			<button className="search-icon" onClick={handleSubmit}><FaSearch/></button>
		</form>
	)
}

export const SearchResult = (result: ResultInfo) => {

	return (
		<div className="search-result">
			<div className="result-name">
				{result.name}
			</div>
			<div className="result-type">
				{ (result.isPrivate === true ? "private" : "public" ) }
			</div>
			<div className="result-action">
				<Modal
					buttonText="join"
					content={
						(result.isPrivate === true ?
							<PrivateJoin channelId={result.id}/> :
							<PublicJoin channelId={result.id}/>
						)}
				/>
			</div>
		</div>
	)
}

export const Search = () => {

	const [searchParams, setSearchParams] = useSearchParams();
	const [results, setResults] = useState<ResultInfo[]>([]);
	const searchTerm = searchParams.get("query");
	const query = (searchTerm === null ? "" : searchTerm);
	const text = ( searchTerm === "" ? "Showing all public channels" : "");

	const fetchData = async (URL: string) => {
		try {
			const res = await axios.get(URL);
			setResults(res.data);
		} catch (error:any) {
			console.log("Channel Search - Error fetching all public channels", error.response.data.message);
		}
	};

	const detchFata = async (query: string) => {
		try {
			const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/chat/channel/search`, {
				params: {
					query: query
				}
			});
			setResults(res.data);
		} catch (error: any) {
			console.log("Channel Search - Error fetching search results", error.response.data.message);
		}
	};

	useEffect(() => {
		if (query === "")
			fetchData(`${process.env.REACT_APP_SERVER_URL}/chat/channel/public_channel_list`);
		else
			detchFata(query);
	}, [query]);


	return (
		<div className="search-container">
			<SearchBar />
			<p> Search results for <em> "{ query }"</em><br/> { text }</p>
			<ul className="search-results" id="chat-search-results">
				{results.map((result) => (
					<li key={result.id}>
						<SearchResult
							id={result.id}
							name={result.name}
							isPrivate={result.isPrivate}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
