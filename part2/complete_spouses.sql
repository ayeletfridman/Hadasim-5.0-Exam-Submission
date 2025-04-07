INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT f.Relative_Id, f.Person_Id, 
       CASE WHEN p.Gender = 'זכר' THEN 'בת זוג' ELSE 'בן זוג' END --insert the opposite connection
FROM family_tree f
JOIN persons p ON f.Person_Id = p.Person_Id
LEFT JOIN family_tree ft ON f.Relative_Id = ft.Person_Id AND f.Person_Id = ft.Relative_Id
WHERE f.Connection_Type IN ('בן זוג', 'בת זוג') 
AND ft.Person_Id IS NULL;
