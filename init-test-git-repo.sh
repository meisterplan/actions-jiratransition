#!/bin/bash

rm -rf test-git-repo
git init test-git-repo

cd test-git-repo

touch file1
git add file1
git commit -m "Feature 1 without Merge" -m "KNUTH-1001"

# Feature 2
git checkout -b feature/KNUTH-1002
touch file2
git add file2
git commit -m "Complete Feature 2" -m "KNUTH-1002"
git checkout master
git merge --no-ff --no-edit feature/KNUTH-1002

# Feature 3
git checkout -b feature/KNUTH-1003
touch file3
git add file3
git commit -m "Complete Feature 3" -m "KNUTH-1003"
git checkout master
git merge --no-ff --no-edit feature/KNUTH-1003

# Feature 4
git checkout -b feature/KNUTH-1004
touch file4
git add file4
git commit -m "Complete Feature 4" -m "KNUTH-1004"
git checkout master
git merge --no-ff --no-edit feature/KNUTH-1004

# Feature 5
touch file5
git add file5
git commit -m "Feature 5 without Merge" -m "KNUTH-1005"

cd ..
