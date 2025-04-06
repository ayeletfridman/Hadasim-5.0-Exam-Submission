-- add parent relationship
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT p.Person_Id, p.Father_Id, 'אב'
FROM persons p
WHERE p.Father_Id IS NOT NULL

UNION ALL

SELECT p.Person_Id, p.Mother_Id, 'אם'
FROM persons p
WHERE p.Mother_Id IS NOT NULL;

-- add child relationship
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT p.Father_Id, p.Person_Id,
       CASE WHEN p.Gender = 'זכר' THEN 'בן' ELSE 'בת' END
FROM persons p
WHERE p.Father_Id IS NOT NULL

UNION ALL

SELECT p.Mother_Id, p.Person_Id,
       CASE WHEN p.Gender = 'זכר' THEN 'בן' ELSE 'בת' END
FROM persons p
WHERE p.Mother_Id IS NOT NULL;

-- add brother/sister relationship
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT c1.Person_Id, c2.Person_Id, 
       CASE WHEN c1.Gender = 'זכר' THEN 'אח' ELSE 'אחות' END
FROM persons c1
JOIN persons c2 ON c1.Father_Id = c2.Father_Id OR c1.Mother_Id = c2.Mother_Id
WHERE c1.Person_Id <> c2.Person_Id;

-- add boyfriend/girlfriend relationship
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT p.Person_Id, p.Spouse_Id, 
       CASE WHEN p.Gender = 'זכר' THEN 'בן זוג' ELSE 'בת זוג' END
FROM persons p
WHERE p.Spouse_Id IS NOT NULL;
