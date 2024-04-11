import { useState, useEffect } from "react";
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
		description: "Farm (60x), Silk (4x), Chicken" // Added description to plots
	},
	{
		id: 4156,
		name: "4156",
		description: "Farm (60x)" // Added description to plots
	},
	{
		id: 4172,
		name: "4172",
		description: "4x Honey" // Added description to plots
	},
	{
		id: 4171,
		name: "4171",
		description: "Chicken" // Added description to plots
	},
	{
		id: 1309,
		name: "1309",
		description: "4x Salt Mine" // Added description to plots
	},
	{
		id: 0,
		name: "Terraville",
		description: "x" // Added description to plots
	},
	{
		id: -1,
		name: "Sauna",
		description: "Sauna description" // Added description to plots
	}
];

const App = () => {
	// Persistent states
	const [processes, setProcesses] = useState<Process[]>([]);
	const [plots, setPlots] = useState<Plot[]>([]);
	const [activeProcesses, setActiveProcesses] = useState<ActiveProcess[]>([]);

	// Rerender key
	const [rerenderKey, setRerenderKey] = useState<number>(0);

	// Create plot
	const [plotInputId, setPlotInputId] = useState<number>(0);
	const [plotInputName, setPlotInputName] = useState<string>("");
	const [plotInputDescription, setPlotInputDescription] = useState<string>("");

	// Create process
	const [createProcessName, setCreateProcessName] = useState<string>("");
	const [createProcessDuration, setCreateProcessDuration] = useState<number>(0);

	// Create active process
	const [createActiveProcessProcessId, setCreateActiveProcessProcessId] = useState<number>(0);
	const [createActiveProcessPlotId, setCreateActiveProcessPlotId] = useState<number>(0);

	// Modals
	const [isPlotManagementOpen, setIsPlotManagementOpen] = useState<boolean>(false);
	const [isProcessManagementOpen, setIsProcessManagementOpen] = useState<boolean>(false);

	// Plots and processes persistence
	useEffect(() => {
		const loadedPlots = JSON.parse(localStorage.getItem("plots") || "[]") || [];
		const loadedProcesses = JSON.parse(localStorage.getItem("processes") || "[]") || [];
		const loadedActiveProcesses = JSON.parse(localStorage.getItem("activeProcesses") || "[]") || [];

		console.log("Loaded Plots:", loadedPlots);
		console.log("Loaded Processes:", loadedProcesses);
		console.log("Loaded Active Processes:", loadedActiveProcesses);

		if (loadedPlots.length === 0) {
			localStorage.setItem("plots", JSON.stringify(initialPlots));
			setPlots(initialPlots);
		} else {
			setPlots(loadedPlots);
		}

		if (loadedProcesses.length === 0) {
			localStorage.setItem("processes", JSON.stringify(initialProcesses));
			setProcesses(initialProcesses);
		} else {
			setProcesses(loadedProcesses);
		}

		if (loadedActiveProcesses.length === 0) {
			localStorage.setItem("activeProcesses", JSON.stringify(activeProcesses));
			setActiveProcesses(activeProcesses);
		} else {
			setActiveProcesses(loadedActiveProcesses);
		}
	}, []);

	// Persistence listener
	useEffect(() => {
		localStorage.setItem("plots", JSON.stringify(plots));
		localStorage.setItem("processes", JSON.stringify(processes));
		localStorage.setItem("activeProcesses", JSON.stringify(activeProcesses));
	}, [plots, processes, activeProcesses]);

	useEffect(() => {
		const interval = setInterval(() => {
			setRerenderKey(prev => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Plot
	const createPlot = (id: number, name: string, description: string) => {
		setPlots(prev => {
			const newPlots = [...prev, { id, name, description }];
			return newPlots;
		});
	};

	const deletePlot = (id: number) => {
		setPlots(prev => {
			const newPlots = prev.filter(plot => plot.id !== id);
			return newPlots;
		});
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
			startTime: Date.now()
		};

		setActiveProcesses(prev => [...prev, newProcess]);
		setCreateActiveProcessProcessId(0);
		setCreateActiveProcessPlotId(0);
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

	const getRemainingTimeUnix = (activeProcess: ActiveProcess) => {
		const process = processes.find(p => p.id === activeProcess.processId);
		if (!process) return 0;

		const currentTime = Date.now();
		const endTime = activeProcess.startTime + process.duration * 1000 * 60;
		return endTime - currentTime;
	};

	const getEndTime = (activeProcess: ActiveProcess) => {
		const process = processes.find(p => p.id === activeProcess.processId);
		if (!process) return 0;

		return activeProcess.startTime + process.duration * 1000 * 60;
	};

	const millisToMinutesAndSeconds = (millis: number) => {
		const minutes = Math.floor(millis / 60000);
		const seconds = ((millis % 6000) / 1000).toFixed(0);
		return `${minutes} minutes ${seconds} seconds`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white">
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
				<p className="text-md text-gray-300 mt-2">
					All data entered will be retained in your browser's local storage unless it is cleared.
				</p>
			</header>
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div className="bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-6">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-white">Plot Management</h1>
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

				{isPlotManagementOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
						<div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-lg p-6">
							<div className="flex justify-between items-center mb-4">
								<h1 className="text-2xl font-bold">Plot Management</h1>
								<button
									type="button"
									onClick={() => setIsPlotManagementOpen(false)}
									className="bg-red-800 text-white font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
								>
									Close
								</button>
							</div>
							<div className="space-y-4">
								<form className="grid grid-cols-4 gap-4">
									<div>
										<label className="block font-semibold mb-1">Plot ID</label>
										<input
											type="number"
											placeholder="Plot ID"
											onChange={event => setPlotInputId(parseInt(event.target.value))}
											value={plotInputId}
											className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label className="block font-semibold mb-1">Plot Name</label>
										<input
											type="text"
											placeholder="Plot Name"
											onChange={event => setPlotInputName(event.target.value)}
											value={plotInputName}
											className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label className="block font-semibold mb-1">Plot Description</label>
										<input
											type="text"
											placeholder="Plot Description"
											onChange={event => setPlotInputDescription(event.target.value)}
											value={plotInputDescription}
											className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<button
										type="button"
										onClick={() => createPlot(plotInputId, plotInputName, plotInputDescription)}
										className="bg-blue-800 hover:bg-blue-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Add Plot
									</button>
								</form>
								<div className="space-y-4 mt-4">
									{plots.map(plot => (
										<div
											key={uuidv4()}
											className="flex items-center justify-between bg-gray-800 rounded-md p-4"
										>
											<div>
												<p className="text-lg font-semibold text-white">{plot.name}</p>
												<input
													type="text"
													placeholder="Edit Plot Description"
													onChange={event => {
														const updatedPlots = plots.map(p => {
															if (p.id === plot.id) {
																return { ...p, description: event.target.value };
															}
															return p;
														});
														setPlots(updatedPlots);
													}}
													value={plot.description}
													className="w-80 bg-gray-700 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
												/>
											</div>
											<button
												type="button"
												onClick={() => deletePlot(plot.id)}
												className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
											>
												Delete
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{isProcessManagementOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
						<div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-lg p-6">
							<div className="flex justify-between items-center mb-4">
								<h1 className="text-2xl font-bold">Process Management</h1>
								<button
									type="button"
									onClick={() => setIsProcessManagementOpen(false)}
									className="bg-red-800 text-white font-semibold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
								>
									Close
								</button>
							</div>
							<div className="space-y-4">
								<form
									className="flex justify-between items-centert space-x-4"
									onSubmit={e => {
										e.preventDefault();
										createProcess(createProcessName, createProcessDuration);
									}}
								>
									<div className="flex-1">
										<label htmlFor="process-input" className="block font-semibold mb-1">
											Process
										</label>
										<input
											id="process-input"
											type="text"
											placeholder="Process"
											className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
											value={createProcessName}
											onChange={event => setCreateProcessName(event.target.value)}
										/>
									</div>
									<div className="flex-1">
										<label htmlFor="time-input" className="block font-semibold mb-1">
											Time (minutes)
										</label>
										<input
											id="time-input"
											type="number"
											placeholder="Time"
											className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
											value={createProcessDuration}
											onChange={event => setCreateProcessDuration(parseInt(event.target.value))}
										/>
									</div>
									<button
										type="submit"
										className="bg-blue-800 hover:bg-blue-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900"
									>
										Create Process
									</button>
								</form>
								<div className="space-y-4 mt-4">
									{processes.map(process => (
										<div
											key={uuidv4()}
											className="flex items-center justify-between bg-gray-800 rounded-md p-4"
										>
											<div>
												<p className="text-lg font-semibold text-white">{process.name}</p>
												<p>Duration: {process.duration} minutes</p>
											</div>
											<button
												type="button"
												onClick={() => deleteProcess(process.id)}
												className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
											>
												Delete
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-8">
					<div>
						<h1 className="text-2xl font-bold mb-4">Start process</h1>

						<form className="space-y-4">
							<div>
								<label className="block font-semibold mb-1">Process</label>
								<select
									onChange={event => setCreateActiveProcessProcessId(parseInt(event.target.value))}
									value={createActiveProcessProcessId ? createActiveProcessProcessId : "0"}
									className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
								>
									<option value="None">Please select</option>
									{processes.map(process => (
										<option key={uuidv4()} value={process.id}>
											{process.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block font-semibold mb-1">Plot</label>
								<select
									onChange={event => setCreateActiveProcessPlotId(parseInt(event.target.value))}
									value={createActiveProcessPlotId ? createActiveProcessPlotId : "None"}
									className="w-full bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
								>
									<option value="None">Please select</option>
									{plots.map(plot => (
										<option key={uuidv4()} value={plot.id}>
											{plot.name} - {plot.description}
										</option>
									))}
								</select>
							</div>

							<button
								type="button"
								onClick={() => startProcess(createActiveProcessProcessId, createActiveProcessPlotId)}
								className="bg-green-800 hover:bg-green-9000 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-gray-900"
							>
								Start Process
							</button>
						</form>
					</div>

					<div>
						<div className="flex justify-between items-center mb-4">
							<h1 className="text-2xl font-bold">Active Processes</h1>
							<button
								type="button"
								onClick={() => setActiveProcesses([])}
								className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
							>
								<Trash className="w-6 h-6" />
							</button>
						</div>

						<div className="space-y-6" key={rerenderKey}>
							{activeProcesses
								.sort((a, b) => getRemainingTimeUnix(a) - getRemainingTimeUnix(b))
								.map(activeProcess => {
									const process = processes.find(p => p.id === activeProcess.processId);
									const plot = plots.find(p => p.id === activeProcess.plotId);

									if (!process || !plot) return null;

									return (
										<div
											key={uuidv4()}
											className="bg-gradient-to-r from-blue-800 to-purple-900 shadow-lg rounded-lg p-6"
										>
											<div className="flex justify-between items-center mb-4">
												<h2 className="text-2xl font-bold">
													{process.name} - {plot.name}
												</h2>
												<div className="flex space-x-2">
													<button
														type="button"
														onClick={() => resetActiveProcess(activeProcess.id)}
														className="bg-green-600 hover:bg-green-700 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-gray-900"
													>
														<RefreshCcw className="w-6 h-6" />
													</button>
													<button
														type="button"
														onClick={() => deleteActiveProcess(activeProcess.id)}
														className="bg-red-800 hover:bg-red-900 font-semibold py-2 px-2 rounded-full focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
													>
														<XIcon className="w-6 h-6"  />
													</button>
												</div>
											</div>
											<div className="text-lg mb-4">
												<p>
													<span className="font-semibold">Duration:</span>{" "}
													{process.duration} minutes
												</p>
												<p>
													<span className="font-semibold">Start:</span>{" "}
													{dayjs(activeProcess.startTime).format("DD.MM.YYYY HH:mm")}
												</p>
												<p>
													<span className="font-semibold">End:</span>{" "}
													{dayjs(getEndTime(activeProcess)).format("DD.MM.YYYY HH:mm")}
												</p>
											</div>
											<hr className="my-4 border-gray-800" />
											<div className="text-lg">
												{getRemainingTimeUnix(activeProcess) > 0 && (
													<p>
														<span className="font-semibold">Time left:</span>{" "}
														{millisToMinutesAndSeconds(getRemainingTimeUnix(activeProcess))}
													</p>
												)}
												<p>
													<span className="font-semibold">Pick up:</span>{" "}
													{getRemainingTimeUnix(activeProcess) < 0 ? (
														<span role="img" aria-label="check" className="text-sm">
															✅
														</span>
													) : (
														<span role="img" aria-label="cross" className="text-sm">
															❌
														</span>
													)}
												</p>
											</div>
										</div>
									);
								})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
