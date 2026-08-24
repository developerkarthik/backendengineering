
const allowedFilters = ["category", "minPrice", "maxPrice"];

const createFilters = (query) => {
    // list of filters
    const {category, minPrice, maxPrice} = query; 

    let filters = {};
    if(category) filters = { ...filters, category};
    if(minPrice) filters = { ...filters, minPrice};
    if(maxPrice) filters = { ...filters, maxPrice};

    console.log(filters);
    return filters;
}

const createClause = (filters) => {
    const conditions = []; // category = $1 AND price >= $2 AND price <= $3
    const values = [];
    
    filters && Object.keys(filters).forEach((key, index) => {
        let columnName = key;
        let operator = '=';

        
        if(key === 'minPrice' || key === 'maxPrice') {
            columnName = 'price'
            operator = key === 'minPrice'? '>=' : '<=';
        }

        if(allowedFilters.includes(key)){
            conditions.push(`${columnName+operator}$${index+1}`);
            values.push(filters[key]);
        }
        
    })

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, values }
}

module.exports = {
    createFilters,
    createClause
}