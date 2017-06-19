const ldap = require('./ldap');
const ps = require('./ps');

(function() {
	let p = ldap();
	p.then(() => {
		return ps();
	});
	p.catch((err) => {
		console.error(err);
	});

})();
