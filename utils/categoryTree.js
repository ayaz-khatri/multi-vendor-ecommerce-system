const buildCategoryTree = (categories, countMap = {}) => {
    const map = {};
    const tree = [];

    // Initialize map with children array and count
    categories.forEach(cat => {
        map[cat._id] = { 
            ...cat, 
            children: [], 
            count: countMap[cat._id.toString()] || 0 
        };
    });

    // Build tree
    categories.forEach(cat => {
        if (cat.parentCategory) {
            map[cat.parentCategory]?.children.push(map[cat._id]);
        } else {
            tree.push(map[cat._id]);
        }
    });

    return tree;
};

export default buildCategoryTree;
