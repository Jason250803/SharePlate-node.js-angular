const db = require('../database');

module.exports.getOrganizationIdByAccountId = async (accountId) => {
    try {
        // Query the database to get the restaurant ID associated with the account ID
        const [OrganizationIdResult] = await db.query(`
            SELECT organization_id
            FROM organization
            WHERE account_id = ?;
        `, [accountId]);

        // Check if a restaurant ID was found
        if (!OrganizationIdResult || !OrganizationIdResult.length === 0) {
            throw new Error('organization not found for the provided account ID');
        }
        return OrganizationIdResult[0].organization_id;
    } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        throw error;
    }
};

module.exports.getOrganizationCountryByUserId = async (userId) => {
    const [rows] = await db.query(`
        SELECT o.country
        FROM organization o
        INNER JOIN account a ON o.account_id = a.account_id
        WHERE a.account_id = ?
    `, [userId]);
    const country = rows[0]?.country;
    return country;
};

module.exports.getRestaurantsByCountry = async (country) => {
    const [rows] = await db.query(`
        SELECT DISTINCT a.user_name, r.phone, r.city, r.address, r.logo_path, r.account_id
        FROM restaurant r
        INNER JOIN account a ON r.account_id = a.account_id
        INNER JOIN leftover l ON r.restaurant_id = l.restaurant_id
        WHERE r.country = ?
        AND a.status=1
        AND l.quantity > 0
    `, [country]);
    return rows;
};
// Modify the service function to accept country and type parameters
module.exports.getLeftoversByCountryAndType = async (country, type) => {
    const [rows] = await db.query(`
        SELECT l.*
        FROM leftover l
        INNER JOIN restaurant r ON l.restaurant_id = r.restaurant_id
        WHERE r.country = ? AND l.type = ? AND l.status=1
    `, [country, type]);
    return rows;
};

module.exports.getleftoversbyCountry=async(country)=>{
const[rows]=await db.query(`
Select l.*
from leftover l
INNER JOIN restaurant r on l.restaurant_id=r.restaurant_id
WHERE r.country=?
AND l.status=1
`,[country]);
return rows;
};
