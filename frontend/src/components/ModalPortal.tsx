import React, { ReactElement } from "react";
import Popup from "reactjs-popup";

import 'reactjs-popup/dist/index.css';

interface ContentProps {
	setPassword?: (password: string) => void;
}
interface ModalProps {
	buttonText: string;
	content: ReactElement<ContentProps>;
}

export const Modal = (props: ModalProps) => {

	return (
	<div className="modal-container">
		<Popup
			trigger={
				<button className="button">
					{props.buttonText}
				</button>}
			modal>
			<span> {props.content} </span>  </Popup>
	</div>
	)
}