const { sequelize } = require('../../models');

exports.getAverageNumberOfEmployees = async (startDate, endDate, { precision }) => {
  const averageNumberOfEmployees = await sequelize.query(
    `
      select avg(usersdate.total) from (select count(u.id) as total
      from (select generate_series(min(?)::date, max(?)::date, interval '1 day') as dte
          from users
         ) as d left join
        users u
        on  u.employment_date is not null 
        and (d.dte >= u.employment_date) 
        and (d.dte <= u.delete_date or u.delete_date is null)
      group by d.dte
      order by d.dte) as usersdate
    `,
    {
      replacements: [ startDate, endDate ]
    }
  ).spread((results) => results[0] && results[0].avg || '0');

  if (isNaN(averageNumberOfEmployees)) {
    return averageNumberOfEmployees;
  }

  const averageNumberOfEmployeesToNumber = Number(averageNumberOfEmployees);

  if (typeof precision === 'number') {
    return averageNumberOfEmployeesToNumber.toFixed(precision);
  }

  return averageNumberOfEmployeesToNumber;
};
