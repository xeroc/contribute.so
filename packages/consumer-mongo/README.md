# Consumer

## Environment

TODO: Description of necessary .env file for local development

## Creating indexes in database

To create indexes in database (for efficency) you can run `npm run index` script. You can index a db at anytime, if the fields have already been indexed, they will be skipped.

ChatGPT's explanation of indexes:

"Without indexes, MongoDB must scan every document in a collection (known as a collection scan) to find matches to a query, which becomes extremely slow as data grows. By creating indexes, MongoDB can efficiently locate and retrieve the requested data without examining every document, similar to how a book's index helps you find specific pages without reading the entire book. Indexes are particularly vital for large datasets and queries that need to return results quickly, as they can dramatically reduce query response times from seconds or minutes down to milliseconds. However, it's important to be selective with indexing as each index requires additional disk space and slows down write operations since MongoDB must update the indexes whenever data is modified."
