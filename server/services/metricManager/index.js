const MetricManager = require('./MetricManager');
const MetricManagerTransport = require('./MetricManagerTransport');

const manager = new MetricManager();
const transport = new MetricManagerTransport();
transport.subscribe(manager.lisner);
transport.startServer();
