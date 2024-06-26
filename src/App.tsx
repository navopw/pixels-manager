import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { Link, RefreshCcw, Trash, XIcon } from "lucide-react";

type Plot = {
	id: number;
	name: string;
	description: string; // Added description to plots
};

type Process = {
	id: number;
	name: string;
	duration: number; // The total time a process takes
};

type ActiveProcess = {
	id: number;
	processId: number;
	plotId: number;
	startTime: number;

	soundPlayed: boolean;
};

const initialProcesses: Process[] = [
	{
		id: 1,
		name: "Chicken",
		duration: 60
	},
	{
		id: 2,
		name: "Honey",
		duration: 60
	},
	{
		id: 3,
		name: "Mine",
		duration: 90
	},
	{
		id: 4,
		name: "Cow",
		duration: 90
	},
	{
		id: 5,
		name: "Sauna VIP",
		duration: 60 * 8
	}
];

const initialPlots: Plot[] = [
	{
		id: 4768,
		name: "4768",
		description: "Farm (60x), Silk (4x), Chicken"
	},
	{
		id: 4156,
		name: "4156",
		description: "Farm (60x)"
	},
	{
		id: 4172,
		name: "4172",
		description: "4x Honey"
	},
	{
		id: 4171,
		name: "4171",
		description: "Chicken"
	},
	{
		id: 1309,
		name: "1309",
		description: "4x Salt Mine"
	},
	{
		id: 0,
		name: "Terraville",
		description: ""
	},
	{
		id: -1,
		name: "Sauna",
		description: ""
	}
];

const App = () => {
	// Persistent states
	const [processes, setProcesses] = useState<Process[]>([]);
	const [plots, setPlots] = useState<Plot[]>([]);
	const [activeProcesses, setActiveProcesses] = useState<ActiveProcess[]>([]);

	// Modals
	const [isPlotManagementOpen, setIsPlotManagementOpen] = useState<boolean>(false);
	const [isProcessManagementOpen, setIsProcessManagementOpen] = useState<boolean>(false);

	// Plots and processes persistence
	useEffect(() => {
		const loadData = <T,>(key: string, initialData: T): T => {
			const loadedData = JSON.parse(localStorage.getItem(key) || "[]") || [];
			if (loadedData.length === 0) {
				localStorage.setItem(key, JSON.stringify(initialData));
				return initialData;
			}
			return loadedData;
		};

		const loadedPlots = loadData("plots", initialPlots);
		const loadedProcesses = loadData("processes", initialProcesses);
		const loadedActiveProcesses = loadData("activeProcesses", activeProcesses);

		console.log("Loaded Plots:", loadedPlots);
		console.log("Loaded Processes:", loadedProcesses);
		console.log("Loaded Active Processes:", loadedActiveProcesses);

		setPlots(loadedPlots);
		setProcesses(loadedProcesses);
		setActiveProcesses(loadedActiveProcesses);
	}, []);

	// Persistence listener
	useEffect(() => {
		localStorage.setItem("plots", JSON.stringify(plots));
		localStorage.setItem("processes", JSON.stringify(processes));
		localStorage.setItem("activeProcesses", JSON.stringify(activeProcesses));
	}, [plots, processes, activeProcesses]);

	// Plot
	const createPlot = (name: string, description: string) => {
		const newPlot = {
			id: Math.floor(Math.random() * 1000000),
			name,
			description
		};
		setPlots(prev => [...prev, newPlot]);
	};

	const deletePlot = (id: number) => {
		setPlots(prev => prev.filter(plot => plot.id !== id));
	};

	const updatePlot = (id: number, name: string, description: string) => {
		const updatedPlots = plots.map(plot => {
			if (plot.id === id) {
				return { ...plot, name, description };
			}
			return plot;
		});
		setPlots(updatedPlots);
	};

	// Process
	const createProcess = (processName: string, duration: number) => {
		const newProcess = {
			id: Math.floor(Math.random() * 1000000),
			name: processName,
			duration
		};
		setProcesses(prev => [...prev, newProcess]);
	};

	const deleteProcess = (id: number) => {
		setProcesses(prev => prev.filter(process => process.id !== id));
	};

	const startProcess = (processId: number, plotId: number) => {
		const processFound = processes.find(process => process.id === processId);
		const plotFound = plots.find(plot => plot.id === plotId);

		if (!processFound || !plotFound) {
			alert("Please select a process and a plot");
			return;
		}

		const newProcess: ActiveProcess = {
			id: Math.floor(Math.random() * 1000000),
			processId: processFound.id,
			plotId,
			startTime: Date.now(),

			soundPlayed: false
		};

		setActiveProcesses(prev => [...prev, newProcess]);
	};

	const updateProcess = (id: number, name: string, duration: number) => {
		const updatedProcesses = processes.map(process => {
			if (process.id === id) {
				return { ...process, name, duration };
			}
			return process;
		});
		setProcesses(updatedProcesses);
	};

	// Active process
	const resetActiveProcess = (id: number) => {
		const processIndex = activeProcesses.findIndex(process => process.id === id);
		if (processIndex !== -1) {
			setActiveProcesses(prev => {
				const updatedProcesses = [...prev];
				updatedProcesses[processIndex].startTime = Date.now();
				return updatedProcesses;
			});
		}
	};

	const deleteActiveProcess = (id: number) => {
		setActiveProcesses(prev => {
			const newActiveProcesses = prev.filter(process => process.id !== id);
			return newActiveProcesses;
		});
	};

	return (
		<>
			<PlotManagementDialog
				isOpen={isPlotManagementOpen}
				onClose={() => setIsPlotManagementOpen(false)}
				onPlotCreate={createPlot}
				onPlotDelete={deletePlot}
				onPlotUpdate={updatePlot}
				plots={plots}
			/>

			<ProcessManagementDialog
				isOpen={isProcessManagementOpen}
				onClose={() => setIsProcessManagementOpen(false)}
				onProcessCreate={createProcess}
				onProcessDelete={deleteProcess}
				onProcessUpdate={updateProcess}
				processes={processes}
			/>

			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white">
				<Header />
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div className="bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-6">
							<div className="flex justify-between items-center">
								<h1 className="text-2xl font-bold text-white">Land Management</h1>
								<button
									type="button"
									onClick={() => setIsPlotManagementOpen(true)}
									className="bg-white text-black font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
								>
									Open
								</button>
							</div>
						</div>

						<div className="bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-6">
							<div className="flex justify-between items-center">
								<h1 className="text-2xl font-bold text-white">Process Management</h1>
								<button
									type="button"
									onClick={() => setIsProcessManagementOpen(true)}
									className="bg-white text-black font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
								>
									Open
								</button>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-8">
						<div className="col-span-1">
							<StartProcess processes={processes} plots={plots} onStart={startProcess} />
						</div>

						<div className="col-span-2">
							<ActiveProcesses
								activeProcesses={activeProcesses}
								onDelete={deleteActiveProcess}
								onReset={resetActiveProcess}
								processes={processes}
								plots={plots}
								onClear={() => setActiveProcesses([])}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const Header = () => {
	return (
		<header className="text-center mb-10">
			<div className="flex items-center justify-center space-x-4">
				<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
					Pixels.xyz - Manager
				</h1>
				<div>
					<a href="https://github.com/navopw/pixels-manager" target="_blank" rel="noopener noreferrer">
						<Link className="text-white cursor-pointer">GitHub Repository</Link>
					</a>
				</div>
			</div>

			<p className="text-xl mt-2">An extensive process management tool to farm in Pixels.xyz</p>
			<p className="text-sm text-gray-300 mt-1">
				All data entered will be retained in your browser's local storage unless it is cleared.
			</p>
		</header>
	);
};

// Plot management
type PlotManagementDialogProps = {
	isOpen: boolean;
	onClose: () => void;

	plots: Plot[];
	onPlotDelete: (id: number) => void;
	onPlotCreate: (name: string, description: string) => void;
	onPlotUpdate: (id: number, name: string, description: string) => void;
};

const PlotManagementDialog = (props: PlotManagementDialogProps) => {
	const [plotInputId, setPlotInputId] = useState(0);
	const [plotInputName, setPlotInputName] = useState("");
	const [plotInputDescription, setPlotInputDescription] = useState("");

	// Editing
	const [isEditing, setIsEditing] = useState(false);

	if (!props.isOpen) return null;

	return (
		<div
			className="fixed z-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center"
			onClick={props.onClose}
		>
			<div
				className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-lg p-6 text-white"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-2xl font-bold">Land Management</h1>
					<button
						type="button"
						onClick={props.onClose}
						className="bg-red-800 font-semibold py-2 px-4 rounded-full focus:outline-none"
					>
						Close
					</button>
				</div>
				<div className="space-y-4">
					<form className="grid grid-cols-4 gap-4">
						<div>
							<label className="block font-semibold mb-1">Land ID</label>
							<input
								type="number"
								placeholder="Land ID"
								onChange={event => setPlotInputId(parseInt(event.target.value))}
								value={plotInputId}
								className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
							/>
						</div>
						<div>
							<label className="block font-semibold mb-1">Land Name</label>
							<input
								type="text"
								placeholder="Land Name"
								onChange={event => setPlotInputName(event.target.value)}
								value={plotInputName}
								className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block font-semibold mb-1">Land Description</label>
							<input
								type="text"
								placeholder="Land Description"
								onChange={event => setPlotInputDescription(event.target.value)}
								value={plotInputDescription}
								className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none"
							/>
						</div>
						{isEditing ? (
							<button
								type="button"
								onClick={() => {
									props.onPlotUpdate(plotInputId, plotInputName, plotInputDescription);
									setIsEditing(false);
									setPlotInputId(0);
									setPlotInputName("");
									setPlotInputDescription("");
								}}
								className="bg-green-800 hover:bg-green-900 font-semibold py-2 px-4 rounded-md focus:outline-none"
							>
								Update Plot
							</button>
						) : (
							<button
								type="button"
								onClick={() => props.onPlotCreate(plotInputName, plotInputDescription)}
								className="bg-blue-800 hover:bg-blue-900 font-semibold py-2 px-4 rounded-md focus:outline-none"
							>
								Add Plot
							</button>
						)}
					</form>
					<div className="space-y-4 mt-4">
						{props.plots.map(plot => (
							<div
								key={uuidv4()}
								className="flex items-center justify-between bg-gray-800 rounded-md p-4"
							>
								<div>
									<p className="text-lg font-semibold">{plot.name}</p>
									<p className="text-lg font-semibold">{plot.description}</p>
								</div>
								<div className="flex space-x-2">
									<button
										type="button"
										onClick={() => {
											setIsEditing(true);
											setPlotInputId(plot.id);
											setPlotInputName(plot.name);
											setPlotInputDescription(plot.description);
										}}
										className="bg-yellow-500 hover:bg-yellow-600 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => props.onPlotDelete(plot.id)}
										className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
// Process management
type ProcessManagementDialogProps = {
	isOpen: boolean;
	onClose: () => void;

	processes: Process[];
	onProcessDelete: (id: number) => void;
	onProcessCreate: (name: string, duration: number) => void;
	onProcessUpdate: (id: number, name: string, duration: number) => void;
};

const ProcessManagementDialog = (props: ProcessManagementDialogProps) => {
	const [processInputName, setProcessInputName] = useState("");
	const [processInputDuration, setProcessInputDuration] = useState(0);

	// Editing
	const [processInputId, setProcessInputId] = useState(0);
	const [isEditing, setIsEditing] = useState(false);

	if (!props.isOpen) return null;

	return (
		<div
			className="fixed z-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center"
			onClick={props.onClose}
		>
			<div
				className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-lg p-6 text-white"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-2xl font-bold">Process Management</h1>
					<button
						type="button"
						onClick={props.onClose}
						className="bg-red-800 font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
					>
						Close
					</button>
				</div>
				<div className="space-y-4">
					<form className="flex space-x-4">
						{isEditing && (
							<div>
								<label className="block font-semibold mb-1">Process ID</label>
								<input
									type="number"
									placeholder="Process ID"
									onChange={event => setProcessInputId(parseInt(event.target.value))}
									value={processInputId}
									className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
								/>
							</div>
						)}
						<div>
							<label className="block font-semibold mb-1">Process Name</label>
							<input
								type="text"
								placeholder="Process Name"
								onChange={event => setProcessInputName(event.target.value)}
								value={processInputName}
								className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block font-semibold mb-1">Process Duration</label>
							<input
								type="number"
								placeholder="Process Duration"
								onChange={event => setProcessInputDuration(parseInt(event.target.value))}
								value={processInputDuration}
								className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none"
							/>
						</div>
						{isEditing ? (
							<button
								type="button"
								onClick={() => {
									props.onProcessUpdate(
										Math.random() * 10000,
										processInputName,
										processInputDuration
									);
									setIsEditing(false);
									setProcessInputId(0);
									setProcessInputName("");
									setProcessInputDuration(0);
								}}
								className="bg-green-800 hover:bg-green-900 font-semibold py-2 px-4 rounded-md focus:outline-none"
							>
								Update Process
							</button>
						) : (
							<button
								type="button"
								onClick={() => props.onProcessCreate(processInputName, processInputDuration)}
								className="bg-blue-800 hover:bg-blue-900 font-semibold py-2 px-4 rounded-md focus:outline-none"
							>
								Add Process
							</button>
						)}
					</form>
					<div className="grid grid-cols-2 gap-4">
						{props.processes.map(process => (
							<div
								key={uuidv4()}
								className="flex items-center justify-between bg-gray-800 rounded-md p-4"
							>
								<div>
									<p className="text-lg font-semibold text-white">{process.name}</p>
									<p>{process.duration} minutes</p>
								</div>
								<div className="flex space-x-2">
									<button
										type="button"
										onClick={() => {
											setIsEditing(true);
											setProcessInputId(process.id);
											setProcessInputName(process.name);
											setProcessInputDuration(process.duration);
										}}
										className="bg-yellow-800 hover:bg-yellow-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => props.onProcessDelete(process.id)}
										className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

type StartProcessProps = {
	processes: Process[];
	plots: Plot[];

	onStart: (processId: number, plotId: number) => void;
};

const StartProcess = (props: StartProcessProps) => {
	const [processId, setProcessId] = useState(0);
	const [plotId, setPlotId] = useState(0);

	return (
		<>
			<h1 className="text-2xl font-bold mb-6 text-white">Start Process</h1>

			<form className="space-y-6 bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-6">
				<div>
					<label className="block font-semibold mb-1 text-white">Process</label>
					<select
						onChange={event => setProcessId(parseInt(event.target.value))}
						value={processId ? processId : "0"}
						className="w-full bg-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
					>
						<option value="None">Please select</option>
						{props.processes.map(process => (
							<option key={uuidv4()} value={process.id}>
								{process.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block font-semibold mb-1 text-white">Plot</label>
					<select
						onChange={event => setPlotId(parseInt(event.target.value))}
						value={plotId ? plotId : "None"}
						className="w-full bg-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
					>
						<option value="None">Please select</option>
						{props.plots.map(plot => (
							<option key={uuidv4()} value={plot.id}>
								{plot.name}
								{plot.description.length > 0 ? " - " + plot.description : ""}
							</option>
						))}
					</select>
				</div>

				<button
					type="button"
					onClick={() => props.onStart(processId, plotId)}
					className="w-full bg-green-600 hover:bg-green-700 font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
				>
					Start Process
				</button>
			</form>
		</>
	);
};

type ActiveProcessesProps = {
	activeProcesses: ActiveProcess[];
	processes: Process[];
	plots: Plot[];

	onDelete: (id: number) => void;
	onClear: () => void;

	onReset: (id: number) => void;
};

const ActiveProcesses = (props: ActiveProcessesProps) => {
	const [currentTime, setCurrentTime] = useState(Date.now());

	useEffect(() => {
		const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		props.activeProcesses.forEach(process => {
			const timeLeft = getRemainingTimeUnix(process);

			if (!process.soundPlayed && timeLeft <= 0) {
				playSound();

				process.soundPlayed = true;
			}
		});
	}, [currentTime]);

	const getRemainingTimeUnix = (activeProcess: ActiveProcess) => {
		const process = props.processes.find(p => p.id === activeProcess.processId);
		if (!process) return 0;

		return activeProcess.startTime + process.duration * 1000 * 60 - currentTime;
	};

	const getEndTime = (activeProcess: ActiveProcess) => {
		const process = props.processes.find(p => p.id === activeProcess.processId);
		if (!process) return 0;

		return activeProcess.startTime + process.duration * 1000 * 60;
	};

	const formatRemainingTime = (millis: number) => {
		const minutes = Math.floor(millis / 60000);
		const seconds = Math.floor((millis % 60000) / 1000);

		return minutes > 0 ? `${minutes} minutes ${seconds} seconds` : `${seconds} seconds`;
	};

	const playSound = () => {
		const audio = new Audio("/task-ready.mp3");
		audio.play();
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Active Processes</h1>
				<button
					type="button"
					onClick={props.onClear}
					className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
				>
					<Trash className="w-4 h-4" />
				</button>
			</div>

			<div className="grid grid-cols-1 gap-4">
				{props.activeProcesses
					.sort((a, b) => getRemainingTimeUnix(a) - getRemainingTimeUnix(b))
					.map(activeProcess => {
						const process = props.processes.find(p => p.id === activeProcess.processId);
						const plot = props.plots.find(p => p.id === activeProcess.plotId);

						if (!process || !plot) return null;

						const remainingTime = getRemainingTimeUnix(activeProcess);
						const isCompleted = remainingTime < 0;

						return (
							<div
								key={uuidv4()}
								className={
									"bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-4" +
									(isCompleted ? " border-2 border-green-400" : "")
								}
							>
								<div className="flex justify-between items-center mb-2">
									<h2 className="text-xl font-bold">
										{process.name} - {plot.name}
									</h2>
									<div className="flex space-x-2">
										<button
											type="button"
											onClick={() => props.onReset(activeProcess.id)}
											className="bg-green-600 hover:bg-green-700 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-1 focus:ring-offset-gray-900"
										>
											<RefreshCcw className="w-6 h-6" />
										</button>
										<button
											type="button"
											onClick={() => props.onDelete(activeProcess.id)}
											className="bg-red-700 hover:bg-red-800 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 focus:ring-offset-gray-900"
										>
											<XIcon className="w-6 h-6" />
										</button>
									</div>
								</div>
								<div className="text-md mb-2">
									<p>
										<span className="font-semibold">Duration:</span> {process.duration} minutes
									</p>
									<div className="flex justify-between text-md">
										<div>
											<span className="font-semibold">Start:</span>{" "}
											{dayjs(activeProcess.startTime).format("DD.MM HH:mm")}
										</div>
										<div>
											<span className="font-semibold">End:</span>{" "}
											{dayjs(getEndTime(activeProcess)).format("DD.MM HH:mm")}
										</div>
									</div>
								</div>
								<hr className="my-2 border-gray-800" />
								<div className="text-md flex">
									{!isCompleted ? (
										<div>
											<span className="font-semibold">Timer:</span>{" "}
											<span>{formatRemainingTime(remainingTime)}</span>
										</div>
									) : (
										<span role="img" aria-label="check" className="text-md">
											Timer: ✅
										</span>
									)}
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default App;
