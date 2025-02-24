import React, { useState, useEffect } from 'react';

const MailApp: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);

  useEffect(() => {
    // Fetch emails from the backend API
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails'); // Adjust the endpoint as needed
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  return (
    <div>
      <h1>Mail Application</h1>
      <ul>
        {emails.map((email, index) => (
          <li key={index}>
            <h2>{email.subject}</h2>
            <p>{email.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MailApp;
