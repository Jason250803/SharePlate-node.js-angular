const db =require('../database')
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
module.exports.getLeftoversByRestaurantId = async (restaurantId) => {
    try {
        // Query the database to get available leftovers for the restaurant
        const [leftovers]=await db.query('SELECT * FROM leftover WHERE restaurant_id = ? AND status = 1', [restaurantId]);
        return leftovers;
    } catch (error) {
        console.error('Error fetching available leftovers:', error);
        throw error;
    }
};
module.exports.addLeftover = async (leftoverData) => {
    const { type, name, quantity, expiry_date, status, restaurant_id, leftover_image_path } = leftoverData;
    const defaultStatus = 1; // Set a default value for status if not provided  
    try {
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
    const { type, name, quantity, expiry_date, status, restaurant_id,leftover_image_path } = newData;
    const defaultImagePath = '';
    try {
        const result = await db.query('CALL add_or_edit_leftover(?, ?, ?, ?, ?, ?, ?,?)', [leftoverId,type, name, quantity, expiry_date, status, restaurant_id,leftover_image_path || defaultImagePath]);
        const affectedRows = result[0].affectedRows;   
        return affectedRows;       
    } catch (error) { 
        console.error('Error editing leftover:', error);
        throw error;
    }
};
/*module.exports.reserveQuantityFromLeftover = async (leftoverId, quantityToRemove) => {
    const [result] = await db.query('UPDATE leftover SET quantity = quantity - ? WHERE leftover_id = ?', [quantityToRemove, leftoverId]);
    return result.affectedRows;
};*/

module.exports.addQuantityToLeftover= async (leftoverId, quantityToAdd) => {
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
};

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
