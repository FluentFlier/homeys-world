-- Seed data for Homeys World
-- Run after 001_schema.sql

INSERT INTO cities (slug, name, country, neighborhoods, currency) VALUES
  ('sf', 'San Francisco', 'USA', ARRAY['SoMa','Mission','Hayes Valley','Marina','Nob Hill','Pac Heights','Lower Haight','Castro','Dogpatch','Potrero','Russian Hill','North Beach'], 'USD'),
  ('nyc', 'New York', 'USA', ARRAY['East Village','West Village','Williamsburg','Bushwick','Bed-Stuy','Lower East Side','Upper West Side','Upper East Side','Harlem','Astoria','Long Island City','Park Slope'], 'USD'),
  ('la', 'Los Angeles', 'USA', ARRAY['Santa Monica','Venice','Silver Lake','Echo Park','Hollywood','DTLA','Koreatown','West Hollywood','Culver City','Mar Vista','Los Feliz','Highland Park'], 'USD'),
  ('chicago', 'Chicago', 'USA', ARRAY['Lincoln Park','Wicker Park','Logan Square','Lakeview','Pilsen','Hyde Park','Bucktown','Old Town','River North','West Loop','Andersonville','Uptown'], 'USD'),
  ('austin', 'Austin', 'USA', ARRAY['East Austin','South Congress','Hyde Park','North Loop','Mueller','Downtown','Zilker','Bouldin Creek','Clarksville','Barton Hills','Travis Heights','St. Elmo'], 'USD'),
  ('seattle', 'Seattle', 'USA', ARRAY['Capitol Hill','Fremont','Ballard','University District','Queen Anne','Wallingford','Georgetown','Columbia City','Beacon Hill','Green Lake','Madison Park','SoDo'], 'USD'),
  ('boston', 'Boston', 'USA', ARRAY['Back Bay','Allston','Brighton','Cambridge','Somerville','South End','Jamaica Plain','Brookline','Fenway','Beacon Hill','North End','Dorchester'], 'USD'),
  ('dc', 'Washington DC', 'USA', ARRAY['Dupont Circle','Adams Morgan','Georgetown','Capitol Hill','Shaw','Columbia Heights','Logan Circle','U Street','Petworth','Brookland','Navy Yard','Foggy Bottom'], 'USD'),
  ('miami', 'Miami', 'USA', ARRAY['Brickell','Wynwood','Little Havana','Coconut Grove','Coral Gables','South Beach','Design District','Edgewater','Midtown','Little Haiti','Overtown','Key Biscayne'], 'USD'),
  ('denver', 'Denver', 'USA', ARRAY['Capitol Hill','RiNo','LoDo','Baker','Highlands','Wash Park','Cherry Creek','Five Points','City Park','Sunnyside','Platt Park','Congress Park'], 'USD'),
  ('portland', 'Portland', 'USA', ARRAY['Pearl District','Alberta','Hawthorne','Division','Mississippi','Sellwood','St. Johns','Belmont','Buckman','Nob Hill','Hollywood','Foster-Powell'], 'USD'),
  ('philly', 'Philadelphia', 'USA', ARRAY['Center City','University City','Fishtown','Northern Liberties','South Philly','Manayunk','Rittenhouse','Old City','Fairmount','Graduate Hospital','Kensington','West Philly'], 'USD'),
  ('london', 'London', 'UK', ARRAY['Shoreditch','Dalston','Hackney','Peckham','Brixton','Camden','Islington','Notting Hill','Clapham','Bethnal Green','Stoke Newington','Bermondsey'], 'GBP');
