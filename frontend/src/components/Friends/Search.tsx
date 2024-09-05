import {
	useEffect,
	useState,
	FormEvent } from "react";
import {
	useSearchParams,
	useNavigate } from "react-router-dom"
import { FaSearch } from "react-icons/fa";

import axios from "../../axiosInstance";
import { FriendsSearchResultInfo as ResultInfo } from "../../Types";

export const SearchBar = () => {
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();

	const handleChange = (value: string) => {
		setInput(value);
	}
	
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (input.trim() === "")
			alert("Who are you searching for?")
		else
		{
			const searchTerm = input;
			setInput("");
			navigate("/search");
			setSearchParams({"query": searchTerm}, {replace: true});
		}
	}

	return (
		<div className="friend-search-bar">
			<form onSubmit={handleSubmit} id="friend-search-bar">
				<input type="text"
					placeholder="Search to add friends"
					value={input}
					onChange={(e) => handleChange(e.target.value)}/>
			<button className="search-icon" onClick={handleSubmit}><FaSearch/></button>
			</form>
		</div>
	)
}

export const Search = () => {

	const [searchParams, setSearchParams] = useSearchParams();
	const [results, setResults] = useState<ResultInfo[]>([]);
	const searchTerm = searchParams.get("query");
	const query = (searchTerm === null ? "" : searchTerm);
	const text = ( searchTerm === "" ? "NO" : "");
	const navigate = useNavigate();

	const handleClick = (id: number) => {
		navigate(`/profile/${id}`, {replace: true});
	}

	const fetchData = async (query: string) => {
		try {
			const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/users/search`, {
				params: {
					query: query
				}
			});
			if (res.data)
				setResults(res.data);
		} catch (error: any) {
			console.log(error.response.data.message)
		}
	};

	useEffect(() => {
		fetchData(query)
	}, [query]);


	return (
		<div className="friend-search-container">
			<SearchBar />
			<p> Users corresponding to <em> "{ query }"</em><br/> { text }</p>
			<ul className="friend-search-results">
				{results.map((result) => (
					<li key={result.id}>
						<button
							key={result.id}
							onClick={() => {handleClick(result.id)}}>
								{result.username}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
