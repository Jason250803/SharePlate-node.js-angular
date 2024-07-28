const db =require('../database')


getRestaurantIdByAccountId = async (accountId) => {
    try {
        // Query the database to get the restaurant ID associated with the account ID
        const [restaurantIdResult] = await db.query(`
            SELECT restaurant_id
            FROM restaurant
            WHERE account_id = ?;
        `, [accountId]);

        // Check if a restaurant ID was found
        if (!restaurantIdResult || !restaurantIdResult.length) {
            throw new Error('Restaurant not found for the provided account ID');
        }

        return restaurantIdResult[0].restaurant_id;
    } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        throw error;
    }
};
module.exports.getLeftovers =async()=>{
    const [loRows]=await  db.query('SELECT * FROM leftover')//we can only use await with async
    //.catch(err=>console.log(err)) //we can remove thanks to globle error handler 
    return loRows;
}
module.exports.getLeftoversById = async (id) => {
    const [loRows] = await db.query('SELECT * FROM leftover WHERE leftover_id = ?', [id]);
    // Check if any leftover is found with the given id
    if (loRows.length === 0) {
        throw new Error(`No leftover found with the ID: ${id}`);    
    }        
    return loRows;
}
module.exports.deleteLeftoverById = async (id) => {
    try {
        const result = await db.query('DELETE FROM leftover WHERE leftover_id = ?', [id]);
        //console.log('Delete operation result:', result); // Log the result of the delete operation 
        // Extract the affectedRows from the first element of the result array
        const affectedRows = result[0].affectedRows;
        //console.log('Affected rows:', affectedRows); // Log the number of affected rows
        return affectedRows; // Return the number of affected rows
    } catch (error) {
        console.error('Error deleting leftover:', error);
        throw error; // Rethrow the error to be caught by the route handler
    }
};

// module.exports.getLeftoversByRestaurantId = async (restaurantId) => {
//     try {
//         // Query the database to get available leftovers for the restaurant
//         const [leftovers]=await db.query('SELECT l.name AS leftover_name, l.type AS leftover_type,DATE_FORMAT(l.expiry_date, "%Y-%m-%d") AS expiry_date, l.quantity,l.leftover_image_path FROM leftover l WHERE l.restaurant_id = ? AND l.status = 1;', [restaurantId]);
//         return leftovers;
//     } catch (error) {
//         console.error('Error fetching available leftovers:', error);
//         throw error;
//     }
// };

module.exports.getLeftoversByRestaurantId = async (accountId) => {
    try {
        const restaurantId = await getRestaurantIdByAccountId(accountId);
        // Query the database to get available leftovers for the restaurant
        const [leftovers]=await db.query('SELECT l.name AS name, l.type AS type,DATE_FORMAT(l.expiry_date, "%Y-%m-%d") AS expiry_date, l.quantity,l.leftover_image_path,l.status,l.leftover_id FROM leftover l WHERE l.restaurant_id = ? AND l.status = 1;', [restaurantId]);
        return leftovers;
    } catch (error) {
        console.error('Error fetching available leftovers:', error);
        throw error;
    }
};
// Define a service function to get all leftovers of a restaurant
module.exports.getAllLeftoversByRestaurantId = async (accountId) => {
    try {
        // Get the restaurant ID associated with the account ID
        const restaurantId = await getRestaurantIdByAccountId(accountId);

        // Query the database to get all leftovers for the restaurant
        const [leftovers] = await db.query(`
            SELECT l.name AS leftover_name, l.type AS leftover_type, DATE_FORMAT(l.expiry_date, "%Y-%m-%d") AS expiry_date_formatted, l.quantity, l.leftover_id,l.status,l.leftover_image_path
            FROM leftover l 
            WHERE l.restaurant_id = ?;
        `, [restaurantId]);

        return leftovers;
    } catch (error) {
        console.error('Error fetching all leftovers:', error);
        throw error;
    }
};


// Define a service function to get restaurant information by ID
module.exports.getRestaurantProfileById = async (userId) => {
    try {
        // Query the database to get restaurant information by ID
        const [restaurantInfo] = await db.query(`
            SELECT r.logo_path, r.country, r.address, r.phone, r.city, r.postal_code,
                   a.user_name AS restaurant_username, a.email AS restaurant_email
            FROM restaurant r
            INNER JOIN account a ON r.account_id = a.account_id
            WHERE r.account_id = ?;
        `, [userId]);

        // Check if restaurantInfo is empty
        if (!restaurantInfo) {
            throw new Error('Restaurant not found for the logged-in user');
        }

        return restaurantInfo;
    } catch (error) {
        console.error('Error fetching restaurant information:', error);
        throw error;
    }
};
module.exports.getOrganizationProfileById = async (userId) => {
    try {
        // Query the database to get organization information by ID
        const [organizationInfo] = await db.query(`
            SELECT o.logo_path, o.country, o.address, o.phone, o.city, o.postal_code,
                   a.user_name AS organization_username, a.email AS organization_email
            FROM organization o
            INNER JOIN account a ON o.account_id = a.account_id
            WHERE o.account_id = ?;
        `, [userId]);

        // Check if organizationInfo is empty
        if (!organizationInfo) {
            throw new Error('Organization not found for the logged-in user');
        }

        return organizationInfo;
    } catch (error) {
        console.error('Error fetching organization information:', error);
        throw error;
    }
};

module.exports.updateRestaurantProfile = async (userId, newProfile) => {
    try {
        const { logo_path, country, address,user_name,email, phone, city, postal_code } = newProfile;

        // Query to update restaurant profile
        const updateQuery = `
        UPDATE restaurant r
        INNER JOIN account a ON r.account_id = a.account_id
        SET r.logo_path = ?, 
            r.country = ?, 
            r.address = ?, 
            a.user_name = ?, 
            a.email = ?, 
            r.phone = ?, 
            r.city = ?, 
            r.postal_code = ?
        WHERE r.account_id = ?
        `;
        console.log('Update Query:', updateQuery);

        console.log('Parameters:', [logo_path, country, address, user_name, email, phone, city, postal_code, userId]);
        // Execute the update query
        await db.query(updateQuery, [logo_path, country, address, user_name, email, phone, city, postal_code, userId]);

        return { message: 'Restaurant profile updated successfully' };
    } catch (error) {
        console.error('Error updating restaurant profile:', error);
        throw error;
    }
};
module.exports.updateOrganizationProfile = async (userId, newProfile) => {
    try {
        const { logo_path, country, address, user_name, email, phone, city, postal_code } = newProfile;

        // Query to update organization profile
        const updateQuery = `
            UPDATE organization o
            INNER JOIN account a ON o.account_id = a.account_id
            SET o.logo_path = ?, 
                o.country = ?, 
                o.address = ?, 
                a.user_name = ?, 
                a.email = ?, 
                o.phone = ?, 
                o.city = ?, 
                o.postal_code = ?
            WHERE o.account_id = ?
        `;
        
        // Execute the update query
        await db.query(updateQuery, [logo_path, country, address, user_name, email, phone, city, postal_code, userId]);

        return { message: 'Organization profile updated successfully' };
    } catch (error) {
        console.error('Error updating organization profile:', error);
        throw error;
    }
};

/*module.exports.addLeftover = async (leftoverData) => {
    try {
        if (!leftoverData) {
            throw new Error('Leftover data is undefined');
        }
        const { type, name, quantity, expiry_date, status, restaurant_id, leftover_image_path } = leftoverData;
        const defaultStatus = 1; // Set a default value for status if not provided  
        console.log('Adding leftover to the database:', leftoverData); // Log the leftover data
        const result = await db.query ('CALL add_or_edit_leftover( ?, ?, ?, ?, ?, ?, ?, ?)', [0,type,name,quantity,expiry_date,status||defaultStatus,restaurant_id,leftover_image_path]);
        const affectedRows = result[0].affectedRows;
        return affectedRows; 
    } catch (error) {            
        console.error('Error adding leftover to the database:', error);
        throw error;     
    }   
};

module.exports.editLeftover = async (leftoverId, newData) => {
    const defaultStatus=1;
    const { type, name, quantity, expiry_date, status, restaurant_id,leftover_image_path } = newData;     
    const defaultImagePath = '';
    try {
        const result = await db.query('CALL add_or_edit_leftover(?, ?, ?, ?, ?, ?, ?,?)', [leftoverId,type, name, quantity, expiry_date, status||defaultStatus, restaurant_id,leftover_image_path || defaultImagePath]);
        const affectedRows = result[0].affectedRows;   
        return affectedRows;       
    } catch (error) { 
        console.error('Error editing leftover:', error);
        throw error;
    }
};*/
/*module.exports.reserveQuantityFromLeftover = async (leftoverId, quantityToRemove) => {
    const [result] = await db.query('UPDATE leftover SET quantity = quantity - ? WHERE leftover_id = ?', [quantityToRemove, leftoverId]);
    return result.affectedRows;
};*/
/*module.exports.addQuantityToLeftover= async (leftoverId, quantityToAdd) => {
    const [result] = await db.query('UPDATE leftover SET quantity = quantity + ? WHERE leftover_id = ?', [quantityToAdd, leftoverId]);
    return result.affectedRows;
};
module.exports.reserveQuantityFromLeftover = async (leftoverId, quantityToRemove) => {
    const [result] = await db.query('UPDATE leftover SET quantity = quantity - ? WHERE leftover_id = ?', [quantityToRemove, leftoverId]);
    
    // Check if the quantity becomes zero after subtraction
    if (result.affectedRows > 0) {
        const [updatedLeftover] = await db.query('SELECT quantity FROM leftover WHERE leftover_id = ?', [leftoverId]);
        const newQuantity = updatedLeftover[0].quantity;

        if (newQuantity === 0) {
            // Update the status to 2 if quantity becomes zero
            await db.query('UPDATE leftover SET status = 2 WHERE leftover_id = ?', [leftoverId]);
        }
    }

    return result.affectedRows;
};*/

module.exports.getActiveLeftoversSummary = async () => {
    const [loRows] = await db.query('SELECT leftover_id, type, name, quantity, DATE_FORMAT(expiry_date, "%Y-%m-%d") AS expiry_date ,leftover_image_path FROM leftover WHERE status = ? AND restaurant_id= ?', [1 , 1]);
    return loRows; 
};   

module.exports.getExpiredLeftovers = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
        const [expiredLeftovers] = await db.query('SELECT * FROM leftover WHERE expiry_date < ?', [currentDate]);
        return expiredLeftovers;
    } catch (error) {
        console.error('Error fetching expired leftovers:', error);
        throw error;
    }
};
module.exports.updateLeftoverStatus = async (leftoverId, status) => {
    try {
        const result = await db.query('UPDATE leftover SET status = ? WHERE leftover_id = ?', [status, leftoverId]);
        const affectedRows = result[0].affectedRows;
        return affectedRows;
    } catch (error) {
        console.error('Error updating leftover status:', error);  
        throw error;
    }
};
