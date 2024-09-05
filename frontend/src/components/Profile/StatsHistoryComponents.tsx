import {
	UserType,
	MatchType
} from "../../Types";

export const History = (props: {profileId: number, matches: MatchType[]}) => {

	return (
		<ul className="history-container" id="history-container">
		{
			props.matches.length === 0 ?
				( "No matches played yet" )
			:
				(
					props.matches.map((match) =>
						<Match key={match.gameid}
							playerA={match.playerA}
							playerB={match.playerB}
							won={match.won}
							timestamp={match.timestamp}
						/>
					
				))
		}
		</ul>
	);
}

interface MatchProps {
	playerA: UserType,
	playerB: UserType;
	won: boolean;
	timestamp: Date;
}

const Match = (match: MatchProps) => {

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};
	const timestampDate = new Date(match.timestamp);
	const formattedTimestamp: string =  timestampDate.toLocaleDateString(undefined, options);
	return (
		
		<li className="history-match">
			<span className="match-date">
				{formattedTimestamp}
			</span>
			{match.playerA.username}
			<mark className="match-score">
				<strong>   -   </strong>
			</mark>
			{match.playerB.username}
			<strong>  -  </strong>
			{match.won ? 'Won' : 'Lost'}
		</li>
	)
}

export const Stats = (props: {profileId: number, total: number, wins: number, draws: number, losses: number, rank: string}) => {

	return (
		<div className="stats-container">
			<Statistic stat={props.total} cssId="stats-total" msg="# matches played"/>
			<Statistic stat={props.wins} cssId="stats-wins" msg="# matches won"/>
			<Statistic stat={props.losses} cssId="stats-losses" msg="# matches lost"/>
			<Statistic stat={props.rank} cssId="stats-draws" msg="Rank"/>
		</div>
	);
}

const Statistic = (props: {stat: number | string, cssId: string, msg: string}) => {

	return (
		<div className="stat" id={props.cssId}>
			<h2>
				{ props.stat }
			</h2>
			<p>
				{ props.msg }
			</p>
		</div>
	)
}
