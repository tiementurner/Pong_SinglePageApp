import { User } from "src/users/users.entity";

export class CreateNotificationDto {

	sender: User;

	receiver: User;

	feature: "friend" | "game" | "dm";

	type: "request" | "response";

	accepted: boolean;

	type_id?: number;
}