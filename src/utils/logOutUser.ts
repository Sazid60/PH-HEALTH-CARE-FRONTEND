export const logOutUser = async() =>{
 await fetch('/api/logout', { method: 'POST' });
 window.location.href = '/';
}