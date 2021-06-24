// Checks if Number is provided
const isNotPhoneNumber = (phoneNumber) => {
    if (phoneNumber.trim() == '' || phoneNumber.trim() == 'whatsapp:') return true;
    else return false;
};
  
const isEmpty = (message) => {
    if (message.trim() == '') return true;
    else return false;
};

exports.validateMessageData = (data) => {
    let errors = {};
  
    if (isNotPhoneNumber(data.phoneNumber)) errors.phoneNumber = 'Phone number not provided';
    if (isEmpty(data.message)) errors.message = 'Message is empty';
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.formatWhatsappNumber = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\s/g, '');
    
    return formattedNumber;
};