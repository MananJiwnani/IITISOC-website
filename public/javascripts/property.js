


async function applyProperty(propertyId) {
    try {
        const response = await fetch(`/api/vacancies/${propertyId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to apply for property');
        }
        alert('Application sent successfully');
    } catch (error) {
        console.error('Error applying for property:', error);
        alert('Error applying for property');
    }
}