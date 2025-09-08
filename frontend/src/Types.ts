import { Socket } from "socket.io-client";

// GENERAL

/** 
 * @id number
 * @username string
 */
export interface UserType {
	id: number,
	username: string
}

// ACCOUNT

/**
 * @username string
 * @image string
 * @is2FAenabled boolean
 */
export interface AccountType {
	username: string,
	image: string,
	is2FAenabled: boolean
}

// AUTHENTICATE

/**
 * @userId number
 * @authenticated boolean
 * @login (redirect: VoidFunction) => void
 * @loginTestUser (redirect: VoidFunction) => void
 * @logout (redirect: VoidFunction) => void
 */

export interface AuthContextType {
	userId: number;
	authenticated: boolean;
	login: (redirect: VoidFunction) => void;
	login42: (redirect: VoidFunction) => void;
	loginTestUser: (redirect: VoidFunction) => void;
	loginTestUser2: (redirect: VoidFunction) => void;
	logout: (redirect: VoidFunction) => void;
}

// PROFILE

/**
 * @id number
 * @username string
 * @avatar string
 * @friends {@link UserType}[]
 * @statsHistory {@link StatsHistoryData}
 */
export interface ProfileData {
	id: number,
	username: string,
	avatar: string,
	friends: UserType[],
	statsHistory: StatsHistoryData,
	isFriend: boolean
}

/**
 * @matches {@link MatchType}[]
 * @total number
 * @wins number
 * @draws number
 * @losses number
 */
export interface StatsHistoryData {
	matches: MatchType[],
	total: number,
	wins: number,
	draws: number,
	losses: number,
	rank: string
}

/**
 * @gameid number
 * @timestamp date
 */
export interface MatchType {
	gameid: number,
	timestamp: Date,
	gametype: number,
	won: boolean,
	playerA: UserType,
	playerB: UserType
}

export enum ProfileDisplay {
	Stats = 0,
	Friends = 1
}

// FRIENDS

/**
 * @username string
 * @id number
 */
export interface FriendsSearchResultInfo {
	username: string;
	id: number;
}


// CHAT

/**
 * @username string
 * @id number
 * @isOwner boolean
 * @isAdmin boolean
 */
export interface Member {
	username: string,
	id: number,
	isOwner: boolean,
	isAdmin: boolean
}

/**
 * @members {@link Member}[]
 * @admins number[]
 * @userIsAdmin boolean
 * @userIsOwner boolean
 * @isPrivate boolean
 * @isDM boolean
 * @name string
 */
export interface ChannelInfoType {
	members: Member[];
	admins: number[];
	userIsAdmin: boolean;
	userIsOwner: boolean;
	isPrivate: boolean;
	isDM: boolean;
	name: string;
}

/**
 * @state number
 * @setState (state: number) => void
 * @name string
 */
export interface ChannelProps {
	state: number;
	setState: (state: number) => void;
	name: string;
}

/**
 * @member {@link Member}
 * @blocked boolean
 * @isUser boolean
 * @userIsAdmin boolean
 * @userIsOwner boolean
 */
export interface MemberContextType {
	member: Member,
	blocked: boolean,
	isUser: boolean,
	userIsAdmin: boolean,
	userIsOwner: boolean
};

/**
 * @id number
 * @sender string
 * @content string
 */
export interface Message {
	id: number;
	sender: string;
	content: string;
}

/**
 * @id number
 * @name string
 * @msgs {@link Message}[]
 */
export interface Channel {
	id: number;
	name: string;
	msgs: Message[];
}

/**
 * @enum ChannelDisplay
 * Screen = 1
 * Menu = 2
 */
export enum ChannelDisplay {
	Screen = 1,
	Menu = 2
}

/**
 * @param message {@link Message}
 * @returns Promise<{status: number}>
 */
export type AddMessage = (message: Message) => Promise<{status: number}>;

/**
 * @param id number
 * @param name string
 * @returns void
 */
export type AddChannel = (id: number, name: string) => void;

/**
 * @channels {@link Channel}[]
 * @addChannel {@link AddChannel}
 * @sentMsgs {@link Message}[]
 * @setSentMsgs (message: {@link Message}[]) => void
 * @addMessage {@link AddMessage}
 */
export interface ChatContextType {
	channels: Channel[];
	addChannel: AddChannel;
	sentMsgs: Message[];
	setSentMsgs: (message: Message[]) => void; 
	addMessage: AddMessage;
}

export enum CreateChannelMask {
	Valid = 0,
	NoName = 2,
	DuplicateName = 4,
	NoPassword = 8,
	ServerError = 16
}
/**
 * @name string
 * @id number
 * @isPrivate boolean
 */
export interface ChannelSearchResultInfo {
	name: string;
	id: number;
	isPrivate: boolean;
}

// NOTIFICATIONS
/**
 * @id number
 * @sender {@link UserType}
 * @feature "friend" | "game" | "dm"
 * @type string
 * @response boolean
 * @message string
 * @type_id number
 */
export interface NotificationType {
	id: number;
	sender: UserType;
	feature: "friend" | "game" | "dm";
	type: string;
	response: boolean;
	message: string;
	type_id: number;
	level: number;
}
/**
 * @notifications {@link NotificationType}[]
 * @unread boolean
 */
export interface NotificationContext {
	notifications: NotificationType[];
	unread: boolean;
}
/**
 * @notificationsRef React.MutableRefObject<{@link NotificationType}[]
 */
export interface NotificationProps {
	notificationsRef: React.MutableRefObject<NotificationType[]>;
}

// SOCKETS
/**
 * @socket Socket | null
 */
export interface SocketContextType {
    socket: Socket | null;
}

export interface NotificationsContextType {
    socket: Socket | null;
	reload: boolean;
	setReload: React.Dispatch<React.SetStateAction<boolean>>;
}
