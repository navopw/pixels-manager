import { AppState, useStore } from "../store/AppStore";

const TestPage = (props: any) => {
	const state: AppState = useStore((state: any) => state);

	return (
		<div className="h-screen w-screen p-4">
			<h1>Number: {state.n}</h1>
			<button className="" onClick={() => state.incrementN()}>
				Increment
			</button>
		</div>
	);
};

export default TestPage;
