
CREATE TABLE persons (
    Person_Id INTEGER PRIMARY KEY,
    Personal_Name TEXT,
    Family_Name TEXT,
    Gender TEXT,
    Father_Id INTEGER,
    Mother_Id INTEGER,
    Spouse_Id INTEGER
);

CREATE TABLE family_tree (
    Person_Id INTEGER,
    Relative_Id INTEGER,
    Connection_Type TEXT,
    PRIMARY KEY (Person_Id, Relative_Id, Connection_Type)
);
