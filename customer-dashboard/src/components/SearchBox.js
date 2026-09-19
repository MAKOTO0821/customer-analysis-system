import React, { useState } from 'react';
import '../styles/SearchBox.css';

function SearchBox({ customers, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);

    if (value.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      onSearch([]);
      return;
    }

    setIsSearching(true);

    // 顧客名でフィルター
    const results = customers.filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.email.toLowerCase().includes(value.toLowerCase()) ||
      customer.phone.includes(value)
    );

    setSearchResults(results);
    onSearch(results);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    onSearch([]);
  };

  return (
    <div className="search-box">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="🔍 顧客名、メール、電話で検索..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={handleClear} className="clear-btn">
            ✕
          </button>
        )}
      </div>

      {isSearching && searchResults.length > 0 && (
        <div className="search-results">
          <p className="results-count">
            🎯 <strong>{searchResults.length}</strong> 件見つかりました
          </p>
          <div className="results-list">
            {searchResults.map(customer => (
              <div key={customer.id} className="result-item">
                <div className="result-header">
                  <span className="result-name">{customer.name}</span>
                  <span className="result-id">ID: {customer.id}</span>
                </div>
                <div className="result-details">
                  <span className="detail-email">📧 {customer.email}</span>
                  <span className="detail-phone">📞 {customer.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSearching && searchResults.length === 0 && (
        <div className="search-results">
          <p className="no-results">❌ 該当する顧客が見つかりません</p>
        </div>
      )}
    </div>
  );
}

export default SearchBox;
